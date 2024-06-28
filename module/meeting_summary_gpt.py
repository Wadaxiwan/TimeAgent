# coding: utf-8
import openai
import argparse

openai.api_key = 'sk-D96LeIzfqEIlE1tQ29B2Jm4FUVBm9m04T3so2cbUL7p8QsX3'
openai.api_base = 'https://api.chatanywhere.tech/v1'

text = [
    {"role": "system", "content": "你是一名智能助理，擅长总结会议内容和文档，请根据输入内容生成纯文本会议总结。注意不要返回Markdown等格式。"}
]

def getText(role, content):
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
    while getlength(text) > 8000:
        del text[0]
    return text

def call_openai_api(text):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=text
    )
    return response.choices[0].message['content']

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Process some input and output files.')
    parser.add_argument('--in_path', type=str, help='Input file path', required=True)
    parser.add_argument('--out_path', type=str, help='Output file path', required=True)

    args = parser.parse_args()

    in_path = args.in_path
    out_path = args.out_path

    try:
        print("Input gpt file path:", in_path)
        with open(in_path, 'r', encoding='utf-8') as f:
            content = f.read()
            question = checklen(getText("user", content))
            answer = call_openai_api(question)
            with open(out_path, 'w', encoding='utf-8') as ff:
                ff.write(answer)
                print("Answer:", answer)
                getText("assistant", answer)
    except Exception as e:
        print(e)
