from ollama import chat
from ollama import ChatResponse
import re

def _remove_think_block(text: str) -> str:
    # This pattern matches <think>... </think> at the beginning of the string
    pattern = r'^<think>.*?</think>\s*'
    # flags=re.DOTALL allows the dot to match newline characters
    return re.sub(pattern, '', text, flags=re.DOTALL)

def chatting(text: str) -> str | None:
    response: ChatResponse = chat(model="deepseek-r1:1.5b", messages=[
        {
            "role": "user",
            "content": text,
        },
    ])
    response_content = response.message.content
    if not response_content:
        return response_content

    return _remove_think_block(response_content)
