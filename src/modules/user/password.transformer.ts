import { ValueTransformer } from 'typeorm';
import { Hash } from '../../utils/Hash';

export class PasswordTransformer implements ValueTransformer {
  to(value) {
    return Hash.make(value ? value : "123456");
  }

  from(value) {
    return value ? value : "123456";
  }
}
