import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      message = exceptionResponse.message || exception.message;
    } 
    // Handle Prisma specific errors (e.g., Unique constraint failed)
    else if (typeof exception === 'object' && exception !== null && 'code' in exception) {
       const prismaError = exception as any;
       if (prismaError.code === 'P2002') {
         status = HttpStatus.CONFLICT;
         message = 'A record with this data already exists.';
       }
    }

    // This guarantees EVERY error returns this exact shape
    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message, // Standardize to string
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}