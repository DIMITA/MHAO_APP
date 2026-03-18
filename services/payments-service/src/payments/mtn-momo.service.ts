import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface MomoPaymentResult {
  referenceId: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
}

export interface MomoTransactionStatus {
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  amount: number;
  payerMsisdn: string;
  referenceId: string;
}

@Injectable()
export class MtnMomoService {
  private readonly logger = new Logger(MtnMomoService.name);

  private readonly baseUrl: string;
  private readonly subscriptionKey: string;
  private readonly apiUserId: string;
  private readonly apiKey: string;
  private readonly environment: string;
  private readonly callbackUrl: string;

  constructor() {
    this.baseUrl =
      process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
    this.subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY || '';
    this.apiUserId = process.env.MTN_MOMO_API_USER_ID || '';
    this.apiKey = process.env.MTN_MOMO_API_KEY || '';
    this.environment = process.env.MTN_MOMO_ENVIRONMENT || 'sandbox';
    this.callbackUrl = process.env.MTN_MOMO_CALLBACK_URL || '';
  }

  /**
   * Initiates a Mobile Money collection request.
   * For MVP sandbox: mocks a successful payment immediately.
   *
   * In production:
   *   1. POST /collection/v1_0/requesttopay with Authorization bearer token
   *   2. Poll GET /collection/v1_0/requesttopay/{referenceId} for status
   *   3. Or receive webhook callback at callbackUrl
   */
  async requestToPay(
    phoneNumber: string,
    amount: number,
    currency: string = 'XOF',
    externalId: string,
    callbackUrl?: string,
  ): Promise<MomoPaymentResult> {
    const referenceId = uuidv4();

    this.logger.log(
      `[MTN MoMo] requestToPay - phone: ${phoneNumber}, amount: ${amount} ${currency}, ` +
        `externalId: ${externalId}, referenceId: ${referenceId}`,
    );

    // MVP: Mock sandbox simulation — in production, call the real MTN MoMo API
    // Real implementation would:
    // const accessToken = await this.getAccessToken();
    // await axios.post(`${this.baseUrl}/collection/v1_0/requesttopay`, {
    //   amount: String(amount),
    //   currency,
    //   externalId,
    //   payer: { partyIdType: 'MSISDN', partyId: phoneNumber },
    //   payerMessage: 'MHAO Housing Payment',
    //   payeeNote: `Payment ref: ${externalId}`,
    // }, {
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`,
    //     'X-Reference-Id': referenceId,
    //     'X-Target-Environment': this.environment,
    //     'Ocp-Apim-Subscription-Key': this.subscriptionKey,
    //     'X-Callback-Url': callbackUrl || this.callbackUrl,
    //   },
    // });

    this.logger.log(
      `[MTN MoMo] Mock payment initiated successfully, referenceId: ${referenceId}`,
    );

    return {
      referenceId,
      status: 'SUCCESSFUL',
    };
  }

  /**
   * Checks the status of a Mobile Money transaction.
   * For MVP sandbox: always returns SUCCESSFUL.
   *
   * In production: GET /collection/v1_0/requesttopay/{referenceId}
   */
  async getTransactionStatus(
    referenceId: string,
    amount?: number,
    phoneNumber?: string,
  ): Promise<MomoTransactionStatus> {
    this.logger.log(
      `[MTN MoMo] getTransactionStatus for referenceId: ${referenceId}`,
    );

    // MVP: Mock sandbox simulation
    // Real implementation would:
    // const accessToken = await this.getAccessToken();
    // const response = await axios.get(
    //   `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       'X-Target-Environment': this.environment,
    //       'Ocp-Apim-Subscription-Key': this.subscriptionKey,
    //     },
    //   },
    // );
    // return response.data;

    return {
      status: 'SUCCESSFUL',
      amount: amount || 0,
      payerMsisdn: phoneNumber || '',
      referenceId,
    };
  }

  /**
   * Validates a MoMo webhook callback signature.
   * For MVP: basic validation (check referenceId presence).
   *
   * In production: verify HMAC signature from X-Signature header.
   */
  validateCallbackSignature(
    payload: any,
    signature?: string,
  ): boolean {
    // MVP: Accept any callback that has a referenceId
    if (!payload || !payload.referenceId) {
      this.logger.warn('[MTN MoMo] Invalid callback: missing referenceId');
      return false;
    }

    // Production would verify:
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.apiKey)
    //   .update(JSON.stringify(payload))
    //   .digest('hex');
    // return signature === expectedSignature;

    return true;
  }

  /**
   * Obtains an access token from MTN MoMo API.
   * Used internally in production implementation.
   */
  private async getAccessToken(): Promise<string> {
    // Production implementation:
    // const credentials = Buffer.from(`${this.apiUserId}:${this.apiKey}`).toString('base64');
    // const response = await axios.post(
    //   `${this.baseUrl}/collection/token/`,
    //   {},
    //   {
    //     headers: {
    //       Authorization: `Basic ${credentials}`,
    //       'Ocp-Apim-Subscription-Key': this.subscriptionKey,
    //     },
    //   },
    // );
    // return response.data.access_token;
    return 'mock_access_token';
  }
}
