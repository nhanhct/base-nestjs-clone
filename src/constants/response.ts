import { Response } from "express";

//response success
export function SUCCESS(statusCode: number, data: any, msg: string, status: number, response: Response): any {
    return response.status(statusCode).json({ data: data, message: msg, statusCode: statusCode, success: status });
}

//response success
export function SUCCESSTest(statusCode: number, data: any, data2: any, msg: string, status: number, response: Response): any {
    return response.status(statusCode).json({ data: data, data2: data2, message: msg, statusCode: statusCode, success: status });
}

//response fail
export function FAIL(statusCode: number, data: any, msg: string, response: Response): any {
    return response.status(statusCode).json({ data: data, message: msg, statusCode: statusCode, success: 0 });
}

//response data paging
export function SUCCESS_PAGING(statusCode: number, data: any, msg: string, status: number, count: number, response: Response): any {
    return response.status(statusCode).json({ data: data, message: msg, statusCode: statusCode, total: count, success: status });
}

//response no data
export function SUCCESS_NO_DATA(statusCode: number, msg: string, response: any): any {
    return response.status(statusCode).json({ message: msg, success: statusCode });
}

//response no data 
export function SUCCESS_DATA(statusCode: number, data: any, response: any): any {
    return response.status(statusCode).json({ data: data, success: response });
}

//respone login
export function SUCCESS_LOGIN(status: number, data: any, success: number, msg: string, response: any): any {
    return response.status(status).json({ data: data, success: success, message: msg });
}

//respone login
export function SUCCESS_OTP(statusCode: number, success: number, msg: string, otp: string, response: any): any {
    return response.status(statusCode).json({ success: success, message: msg, otp: otp, response: null });
}