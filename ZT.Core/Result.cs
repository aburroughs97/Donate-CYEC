using System;
using System.Collections.Generic;
using System.Text;

namespace ZT.Core
{
    public class Result
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }

        public Result(bool isSuccess, string message = null)
        {
            IsSuccess = isSuccess;
            Message = message;
        }
    }

    public class Result<T> 
    {
        public bool IsSuccess { get; set; }
        public T Payload { get; set; }
        public string Message { get; set; }

        public Result(bool isSuccess, string message = null)
        {
            IsSuccess = isSuccess;
            Message = message;
            Payload = default;
        }

        public Result(T payload)
        {
            if(payload != null)
            {
                IsSuccess = true;
                Message = null;
                Payload = payload;
            }
            else
            {
                IsSuccess = false;
                Message = "Empty payload";
                Payload = default;
            }
        }
    }
}
