/**
 * Service connection testing utility
 * Provides secure and reliable connection testing for various services
 */

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
  responseTime?: number;
}

export interface ServiceCredentials {
  [key: string]: string;
}

class ConnectionTesterService {
  private readonly TEST_TIMEOUT = 10000; // 10 seconds

  /**
   * Create a timeout promise for connection tests
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Connection test timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Test Supabase connection
   */
  async testSupabaseConnection(
    credentials: ServiceCredentials,
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = credentials;

      if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
        return {
          success: false,
          message: "Missing required Supabase credentials (URL and Anon Key)",
        };
      }

      // Validate URL format
      let supabaseUrl: URL;
      try {
        supabaseUrl = new URL(VITE_SUPABASE_URL);
      } catch {
        return {
          success: false,
          message: "Invalid Supabase URL format",
        };
      }

      // Test basic connectivity
      const response = await Promise.race([
        fetch(`${VITE_SUPABASE_URL}/rest/v1/`, {
          method: "GET",
          headers: {
            apikey: VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${VITE_SUPABASE_ANON_KEY}`,
            Accept: "application/json",
          },
        }),
        this.createTimeoutPromise(this.TEST_TIMEOUT),
      ]);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          message: "Supabase connection successful",
          responseTime,
          details: {
            url: supabaseUrl.origin,
            status: response.status,
          },
        };
      } else {
        const errorText = await response.text().catch(() => "Unknown error");
        return {
          success: false,
          message: `Supabase connection failed: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            error: errorText,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Supabase connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Test PayPal connection
   */
  async testPayPalConnection(
    credentials: ServiceCredentials,
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      const {
        VITE_PAYPAL_CLIENT_ID,
        PAYPAL_CLIENT_SECRET,
        PAYPAL_ENVIRONMENT,
      } = credentials;

      if (!VITE_PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        return {
          success: false,
          message: "Missing required PayPal credentials (Client ID and Secret)",
        };
      }

      const environment = PAYPAL_ENVIRONMENT || "sandbox";
      const baseUrl =
        environment === "production"
          ? "https://api.paypal.com"
          : "https://api.sandbox.paypal.com";

      // Test OAuth token generation
      const response = await Promise.race([
        fetch(`${baseUrl}/v1/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`${VITE_PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
            Accept: "application/json",
          },
          body: "grant_type=client_credentials",
        }),
        this.createTimeoutPromise(this.TEST_TIMEOUT),
      ]);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: `PayPal ${environment} connection successful`,
          responseTime,
          details: {
            environment,
            tokenType: data.token_type,
            expiresIn: data.expires_in,
          },
        };
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        return {
          success: false,
          message: `PayPal connection failed: ${errorData.error_description || errorData.error || "Unknown error"}`,
          details: {
            status: response.status,
            environment,
            error: errorData,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `PayPal connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Test Resend connection
   */
  async testResendConnection(
    credentials: ServiceCredentials,
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      const { RESEND_API_KEY } = credentials;

      if (!RESEND_API_KEY) {
        return {
          success: false,
          message: "Missing Resend API key",
        };
      }

      // Validate API key format
      if (!RESEND_API_KEY.startsWith("re_")) {
        return {
          success: false,
          message: 'Invalid Resend API key format (should start with "re_")',
        };
      }

      // Test API access with domains endpoint
      const response = await Promise.race([
        fetch("https://api.resend.com/domains", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            Accept: "application/json",
          },
        }),
        this.createTimeoutPromise(this.TEST_TIMEOUT),
      ]);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: "Resend connection successful",
          responseTime,
          details: {
            domainsCount: data.data?.length || 0,
          },
        };
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        return {
          success: false,
          message: `Resend connection failed: ${errorData.message || "API access denied"}`,
          details: {
            status: response.status,
            error: errorData,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Resend connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Test GitHub connection
   */
  async testGitHubConnection(
    credentials: ServiceCredentials,
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      const { GITHUB_TOKEN } = credentials;

      if (!GITHUB_TOKEN) {
        return {
          success: true,
          message: "GitHub token not provided (optional)",
        };
      }

      // Validate token format
      if (
        !GITHUB_TOKEN.startsWith("ghp_") &&
        !GITHUB_TOKEN.startsWith("github_pat_")
      ) {
        return {
          success: false,
          message: "Invalid GitHub token format",
        };
      }

      // Test API access
      const response = await Promise.race([
        fetch("https://api.github.com/user", {
          method: "GET",
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "NeuroLint-App",
          },
        }),
        this.createTimeoutPromise(this.TEST_TIMEOUT),
      ]);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const userData = await response.json();
        return {
          success: true,
          message: "GitHub connection successful",
          responseTime,
          details: {
            username: userData.login,
            accountType: userData.type,
            rateLimit: response.headers.get("X-RateLimit-Remaining"),
          },
        };
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        return {
          success: false,
          message: `GitHub connection failed: ${errorData.message || "API access denied"}`,
          details: {
            status: response.status,
            error: errorData,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `GitHub connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Validate system configuration
   */
  async testSystemConfiguration(
    credentials: ServiceCredentials,
  ): Promise<ConnectionTestResult> {
    try {
      const { VITE_APP_URL, ENVIRONMENT } = credentials;
      const issues: string[] = [];

      // Validate app URL
      if (VITE_APP_URL) {
        try {
          const appUrl = new URL(VITE_APP_URL);
          if (!["https:", "http:"].includes(appUrl.protocol)) {
            issues.push("App URL must use HTTP or HTTPS protocol");
          }
        } catch {
          issues.push("Invalid App URL format");
        }
      }

      // Validate environment
      if (
        ENVIRONMENT &&
        !["development", "staging", "production"].includes(ENVIRONMENT)
      ) {
        issues.push("Environment must be development, staging, or production");
      }

      return {
        success: issues.length === 0,
        message:
          issues.length === 0
            ? "System configuration is valid"
            : `Configuration issues: ${issues.join(", ")}`,
        details: {
          issues: issues.length,
          environment: ENVIRONMENT,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `System configuration error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Test all connections for a given service
   */
  async testConnection(
    serviceId: string,
    credentials: ServiceCredentials,
  ): Promise<ConnectionTestResult> {
    switch (serviceId) {
      case "supabase":
        return this.testSupabaseConnection(credentials);
      case "paypal":
        return this.testPayPalConnection(credentials);
      case "resend":
        return this.testResendConnection(credentials);
      case "github":
        return this.testGitHubConnection(credentials);
      case "system":
        return this.testSystemConfiguration(credentials);
      default:
        return {
          success: false,
          message: `Unknown service: ${serviceId}`,
        };
    }
  }
}

export const connectionTester = new ConnectionTesterService();
