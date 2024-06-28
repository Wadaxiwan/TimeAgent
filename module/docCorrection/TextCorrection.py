# -*- coding:utf-8 -*-
from datetime import datetime
from wsgiref.handlers import format_date_time
from time import mktime
import hashlib
import base64
import hmac
from urllib.parse import urlencode
import json
import requests
import argparse


class AssembleHeaderException(Exception):
    def __init__(self, msg):
        self.message = msg


class Url:
    def __init__(this, host, path, schema):
        this.host = host
        this.path = path
        this.schema = schema
        pass


class WebsocketDemo:
    def __init__(self,APPId,APISecret,APIKey,Text):
        self.appid = APPId
        self.apisecret = APISecret
        self.apikey = APIKey
        self.text = Text
        self.url = 'https://api.xf-yun.com/v1/private/s9a87e3ec'

    # calculate sha256 and encode to base64
    def sha256base64(self,data):
        sha256 = hashlib.sha256()
        sha256.update(data)
        digest = base64.b64encode(sha256.digest()).decode(encoding='utf-8')
        return digest


    def parse_url(self,requset_url):
        stidx = requset_url.index("://")
        host = requset_url[stidx + 3:]
        schema = requset_url[:stidx + 3]
        edidx = host.index("/")
        if edidx <= 0:
            raise AssembleHeaderException("invalid request url:" + requset_url)
        path = host[edidx:]
        host = host[:edidx]
        u = Url(host, path, schema)
        return u


    # build websocket auth request url
    def assemble_ws_auth_url(self,requset_url, method="POST", api_key="", api_secret=""):
        u = self.parse_url(requset_url)
        host = u.host
        path = u.path
        now = datetime.now()
        date = format_date_time(mktime(now.timetuple()))
        #print(date)
        # date = "Thu, 12 Dec 2019 01:57:27 GMT"
        signature_origin = "host: {}\ndate: {}\n{} {} HTTP/1.1".format(host, date, method, path)
        #print(signature_origin)
        signature_sha = hmac.new(api_secret.encode('utf-8'), signature_origin.encode('utf-8'),
                                 digestmod=hashlib.sha256).digest()
        signature_sha = base64.b64encode(signature_sha).decode(encoding='utf-8')
        authorization_origin = "api_key=\"%s\", algorithm=\"%s\", headers=\"%s\", signature=\"%s\"" % (
            api_key, "hmac-sha256", "host date request-line", signature_sha)
        authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')
        #print(authorization_origin)
        values = {
            "host": host,
            "date": date,
            "authorization": authorization
        }

        return requset_url + "?" + urlencode(values)


    def get_body(self):
        body =  {
            "header": {
                "app_id": self.appid,
                "status": 3,
                #"uid":"your_uid"
            },
            "parameter": {
                "s9a87e3ec": {
                    #"res_id":"your_res_id",
                    "result": {
                        "encoding": "utf8",
                        "compress": "raw",
                        "format": "json"
                    }
                }
            },
            "payload": {
                "input": {
                    "encoding": "utf8",
                    "compress": "raw",
                    "format": "plain",
                    "status": 3,
                    "text": base64.b64encode(self.text.encode("utf-8")).decode('utf-8')
                }
            }
        }
        return body

    def get_result(self):
        request_url = self.assemble_ws_auth_url(self.url, "POST", self.apikey, self.apisecret)
        headers = {'content-type': "application/json", 'host':'api.xf-yun.com', 'app_id':self.appid}
        body = self.get_body()
        response = requests.post(request_url, data = json.dumps(body), headers = headers)
        # print('onMessage：\n' + response.content.decode())
        tempResult = json.loads(response.content.decode())
        # print('text字段解析：\n' + base64.b64decode(tempResult['payload']['result']['text']).decode())
        return base64.b64decode(tempResult['payload']['result']['text']).decode()

# def getText(role,content):
#     jsoncon = {}
#     jsoncon["role"] = role
#     jsoncon["content"] = content
#     text.append(jsoncon)
#     return text

# def getlength(text):
#     length = 0
#     for content in text:
#         temp = content["content"]
#         leng = len(temp)
#         length += leng
#     return length

# def checklen(text):
#     while (getlength(text) > 8000):
#         del text[0]
#     return text


if __name__ == '__main__':
    #控制台获取
    APPId = "3392c9b4"
    APISecret = "NjczZjNkOTRiZDUzYWMwZTMyZmZlNjBj"
    APIKey = "33cfd171c5a0f1ca426e80022a21d0de"
    parser = argparse.ArgumentParser(description='Process some input and output files.')
    parser.add_argument('--in_path', type=str, help='Input file path', required=True)
    parser.add_argument('--out_path', type=str, help='Output file path', required=True)
    args = parser.parse_args()

    in_path = args.in_path
    out_path = args.out_path
    Text = ""
    with open(in_path,'r',encoding='utf-8') as f:
        content = f.read()
        # Text = checklen(getText("user",content))
        # print(content)
        Text = content
        demo = WebsocketDemo(APPId,APISecret,APIKey,Text)
        result = demo.get_result()
        json_obj = json.loads(result)
        with open(out_path,'w',encoding='utf-8') as outFile:
            json.dump(json_obj,outFile,ensure_ascii=False,indent=4)
    #需纠错文本
    # Text="衣据，鱿鱼圈，战士，画蛇天足，足不初户，狐假唬威，威风凛领，轮到"

    # demo = WebsocketDemo(APPId,APISecret,APIKey,Text)
    # result = demo.get_result()
    # # print(type(result))
    # # print('\n\n')
    # json_obj = json.loads(result)
    # with open('./output/output.json','w',encoding='utf-8') as outFile:
    #     json.dump(json_obj,outFile,ensure_ascii=False,indent=4)
    # # 返回值含义参见链接
    # # https://www.xfyun.cn/doc/nlp/textCorrection/API.html#%E8%BF%94%E5%9B%9E%E7%BB%93%E6%9E%9C
    # print('创建json文件成功')
    # # print(result)


