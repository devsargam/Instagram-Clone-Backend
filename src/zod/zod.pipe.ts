import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodObject } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  // eslint-disable-next-line
  constructor(private schema: ZodObject<any>) {}

  async transform(
    value: unknown,
    // eslint-disable-next-line
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    try {
      await this.schema.parseAsync(value);
    } catch (error) {
      // Send user the first error in the schema
      throw new BadRequestException(error.errors[0].message);
    }
    return value;
  }
}
