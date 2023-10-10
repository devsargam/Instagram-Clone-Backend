import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodObject } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  // eslint-disable-next-line
  constructor(private schema: ZodObject<any>) {}

  // eslint-disable-next-line
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    try {
      this.schema.parse(value);
    } catch (error) {
      // Send user the first error in the schema
      throw new BadRequestException(error.errors[0].message);
    }
    return value;
  }
}
