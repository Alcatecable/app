/**
 * Secure credential storage service
 * Handles encryption, validation, and secure storage of sensitive credentials
 */

export interface CredentialData {
  [serviceId: string]: {
    [fieldKey: string]: string;
  };
}

export interface EncryptedCredential {
  data: string;
  timestamp: number;
  checksum: string;
}

class CredentialStorageService {
  private readonly STORAGE_KEY = "neurolint_admin_credentials";
  private readonly ENCRYPTION_KEY_STORAGE = "neurolint_encryption_key";

  /**
   * Simple encryption using Web Crypto API (for demo purposes)
   * In production, use proper encryption with backend key management
   */
  private async getEncryptionKey(): Promise<CryptoKey> {
    let keyData = localStorage.getItem(this.ENCRYPTION_KEY_STORAGE);

    if (!keyData) {
      // Generate new key if none exists
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
      );

      const exportedKey = await crypto.subtle.exportKey("jwk", key);
      localStorage.setItem(
        this.ENCRYPTION_KEY_STORAGE,
        JSON.stringify(exportedKey),
      );
      return key;
    }

    const importedKey = await crypto.subtle.importKey(
      "jwk",
      JSON.parse(keyData),
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );

    return importedKey;
  }

  private async encrypt(data: string): Promise<EncryptedCredential> {
    const key = await this.getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encodedData,
    );

    // Create checksum for integrity verification
    const checksum = await this.createChecksum(data);

    return {
      data:
        Array.from(new Uint8Array(encrypted))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("") +
        "::" +
        Array.from(iv)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      timestamp: Date.now(),
      checksum,
    };
  }

  private async decrypt(encryptedData: EncryptedCredential): Promise<string> {
    const key = await this.getEncryptionKey();
    const [dataHex, ivHex] = encryptedData.data.split("::");

    const data = new Uint8Array(
      dataHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
    );
    const iv = new Uint8Array(
      ivHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data,
    );

    const decryptedText = new TextDecoder().decode(decrypted);

    // Verify checksum
    const expectedChecksum = await this.createChecksum(decryptedText);
    if (expectedChecksum !== encryptedData.checksum) {
      throw new Error("Data integrity check failed");
    }

    return decryptedText;
  }

  private async createChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Validate credential data before storage
   */
  private validateCredentials(credentials: CredentialData): string[] {
    const errors: string[] = [];

    Object.entries(credentials).forEach(([serviceId, serviceData]) => {
      Object.entries(serviceData).forEach(([fieldKey, value]) => {
        // Check for suspicious patterns
        if (typeof value !== "string") {
          errors.push(`Invalid data type for ${serviceId}.${fieldKey}`);
        }

        // Check for common security issues
        if (value.includes("<script>") || value.includes("javascript:")) {
          errors.push(
            `Potentially malicious content in ${serviceId}.${fieldKey}`,
          );
        }

        // Validate URL fields
        if (fieldKey.includes("URL") && value && !this.isValidUrl(value)) {
          errors.push(`Invalid URL format for ${serviceId}.${fieldKey}`);
        }

        // Validate email fields
        if (fieldKey.includes("EMAIL") && value && !this.isValidEmail(value)) {
          errors.push(`Invalid email format for ${serviceId}.${fieldKey}`);
        }
      });
    });

    return errors;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Store credentials securely
   */
  async storeCredentials(credentials: CredentialData): Promise<void> {
    // Validate data before storing
    const validationErrors = this.validateCredentials(credentials);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
    }

    try {
      const dataToStore = JSON.stringify(credentials);
      const encrypted = await this.encrypt(dataToStore);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encrypted));
    } catch (error) {
      throw new Error(
        `Failed to store credentials: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Retrieve and decrypt credentials
   */
  async retrieveCredentials(): Promise<CredentialData> {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) {
        return {};
      }

      const encryptedData: EncryptedCredential = JSON.parse(storedData);

      // Check if data is too old (optional security measure)
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      if (Date.now() - encryptedData.timestamp > maxAge) {
        console.warn("Stored credentials are older than 30 days");
      }

      const decryptedData = await this.decrypt(encryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error("Failed to retrieve credentials:", error);
      return {};
    }
  }

  /**
   * Clear all stored credentials
   */
  clearCredentials(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ENCRYPTION_KEY_STORAGE);
  }

  /**
   * Export credentials for backup (still encrypted)
   */
  async exportCredentials(): Promise<string> {
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    if (!storedData) {
      throw new Error("No credentials to export");
    }

    return storedData;
  }

  /**
   * Import credentials from backup
   */
  async importCredentials(backupData: string): Promise<void> {
    try {
      const encryptedData: EncryptedCredential = JSON.parse(backupData);

      // Validate the backup data structure
      if (
        !encryptedData.data ||
        !encryptedData.checksum ||
        !encryptedData.timestamp
      ) {
        throw new Error("Invalid backup data format");
      }

      // Test decryption to ensure data is valid
      await this.decrypt(encryptedData);

      localStorage.setItem(this.STORAGE_KEY, backupData);
    } catch (error) {
      throw new Error(
        `Failed to import credentials: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

export const credentialStorage = new CredentialStorageService();
