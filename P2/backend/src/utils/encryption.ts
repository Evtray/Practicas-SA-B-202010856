import CryptoJS from 'crypto-js';
import { config } from '../config/env';

export class EncryptionService {
  private static secretKey = config.encryption.aesKey;

  static encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  static decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static encryptObject(obj: any): string {
    const jsonString = JSON.stringify(obj);
    return this.encrypt(jsonString);
  }

  static decryptObject(encryptedText: string): any {
    const decryptedString = this.decrypt(encryptedText);
    return JSON.parse(decryptedString);
  }
}