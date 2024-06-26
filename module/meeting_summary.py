# coding: utf-8
import SparkApi
import time
import argparse
#以下密钥信息从控制台获取   https://console.xfyun.cn/services/bm35
appid = "3392c9b4"     #填写控制台中获取的 APPID 信息
api_secret = "NjczZjNkOTRiZDUzYWMwZTMyZmZlNjBj"   #填写控制台中获取的 APISecret 信息
api_key ="33cfd171c5a0f1ca426e80022a21d0de"    #填写控制台中获取的 APIKey 信息

domain = "generalv3.5"      # Max版本
#domain = "generalv3"       # Pro版本
#domain = "general"         # Lite版本

Spark_url = "wss://spark-api.xf-yun.com/v3.5/chat"   # Max服务地址
#Spark_url = "wss://spark-api.xf-yun.com/v3.1/chat"  # Pro服务地址
#Spark_url = "wss://spark-api.xf-yun.com/v1.1/chat"  # Lite服务地址

#初始上下文内容，当前可传system、user、assistant 等角色
text =[
    # {"role": "system", "content": "你现在扮演李白，你豪情万丈，狂放不羁；接下来请用李白的口吻和用户对话。"} , # 设置对话背景或者模型角色
    # {"role": "user", "content": "你是谁"},  # 用户的历史问题
    # {"role": "assistant", "content": "....."} , # AI的历史回答结果
    # # ....... 省略的历史对话
    # {"role": "user", "content": "你会做什么"}  # 最新的一条问题，如无需上下文，可只传最新一条问题
    # {"role":"system","content":"你是一名会议纪要员，负责对输入的文本进行文本总结"}
    {"role":"system","content":"你是一名总结员，负责对输入的文本进行文本总结（输入可能是会议内容或者文档，请自行判断然后输出合适结果）"}
]


def getText(role,content):
    jsoncon = {}
    jsoncon["role"] = role
    jsoncon["content"] = content
    text.append(jsoncon)
    return text

def getlength(text):
    length = 0
    for content in text:
        temp = content["content"]
        leng = len(temp)
        length += leng
    return length

def checklen(text):
    while (getlength(text) > 8000):
        del text[0]
    return text
    


if __name__ == '__main__':

    # while(1):
    #     Input = input("\n" +"我:")
    #     question = checklen(getText("user",Input))
    #     SparkApi.answer =""
    #     print("星火:",end ="")
    #     SparkApi.main(appid,api_key,api_secret,Spark_url,domain,question)
    #     # print(SparkApi.answer)
    #     getText("assistant",SparkApi.answer)
    parser = argparse.ArgumentParser(description='Process some input and output files.')
    parser.add_argument('--in_path', type=str, help='Input file path', required=True)
    parser.add_argument('--out_path', type=str, help='Output file path', required=True)

    args = parser.parse_args()

    in_path = args.in_path
    out_path = args.out_path
    with open(in_path,'r',encoding='utf-8') as f:
        content = f.read()
        question = checklen(getText("user",content))
        SparkApi.answer = ""
        SparkApi.main(appid,api_key,api_secret,Spark_url,domain,question)
        with open(out_path,'w',encoding='utf-8') as ff:
            ff.write(SparkApi.answer)
            getText("assistant", SparkApi.answer)





