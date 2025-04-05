from langchain_core.prompts import ChatPromptTemplate
import sys
import os
from src.models.schemas import Reception, FindFunction, FinalAnswer
from src.llm.api_call import call_llm
from src.workflow.other_tools import get_params_model, find_function_description, get_parameter_options

import json
from typing import Any

def reception_agent(query: str) -> Reception:
    reception_template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are data analyst specializing in NYC Congestion Relief Zone data.
                    """,
                ),
                (
                    "human",
                    """You are given a user's query.{query} You need to first determine if you need to retrieve data from the dataset to answer the user's query.
                    If you need to retrieve data, you need to describe the data needed to be retrieved, you should provide response as retrieving data from the dataset.
                    If you don't need to retrieve data, you need to provide a response to the user's query.
                    response: The response to the user's query, in a concise and informative manner
                    retrieve_data: do we need to retrieve data from the dataset to answer the user's query
                    data_description: a description of the data needed to be retrieved from the dataset to answer the user's query
                    """,
                ),
            ]
        )
    prompt = reception_template.format(query=query)
    model_name = "gemini-2.0-flash"
    model_provider = "Gemini"
    pydantic_model = Reception
    max_retries = 3
    return call_llm(prompt, model_name, model_provider, pydantic_model, max_retries)

def function_selection_agent(user_query: str, data_description: str, functions_info: json) -> Reception:
    function_selection_template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are data analyst specializing in NYC Congestion Relief Zone data.
                    """,
                ),
                (
                    "human",
                    """You are given a task to retrive data from NYC Congestion Relief Zone data. User is asking for {user_query} 
                    To answer the user's query, you need to retrieve data that is described as {data_description}
                    You need to first determine if one of the functions in the following list can be used to retrieve the data:
                    {functions_info}
                    If yes, you need to provide the name of the function to call to retrieve the data.
                    If no, you need to provide a response to the user's query, informing the user that the data is not available in the dataset.
                    response: The response to the user's query, in a concise and informative manner
                    data_available: do we have the data needed to answer the user's query
                    function_name: the name of the function to call to retrieve the data
                    
                    """,
                ),
            ]
        )
    prompt = function_selection_template.format(user_query=user_query, data_description=data_description, functions_info=functions_info)
    model_name = "gemini-2.0-flash"
    model_provider = "Gemini"
    pydantic_model = FindFunction
    max_retries = 3
    return call_llm(prompt, model_name, model_provider, pydantic_model, max_retries)

def data_retrieval_agent(user_query: str, function_name: str):
    functions_description = find_function_description(function_name)
    functions_description = json.dumps(functions_description)
    parameter_options = get_parameter_options(function_name)
    parameter_options = json.dumps(parameter_options)
    data_retrieval_template = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are data analyst specializing in NYC Congestion Relief Zone data.
                """,
            ),
            (
                "human",
                """You are given a task to retrieve data from NYC Congestion Relief Zone data. User is asking for {user_query} 
                To answer the user's query, you need to retrieve data that is described as {functions_description}
                You need to provide the parameters to pass to the function to retrieve the data. The avalible parameters are {parameter_options}
                You should mapping the user's query to the avalible parameters, you may infer the parameter name from the user's query, but limit you choice to the avalible parameters.
                response: The response to the user's query, in a concise and informative manner
                function_params: the parameters to pass to the function to retrieve the data
                """,
            ),
        ]
    )
    prompt = data_retrieval_template.format(user_query=user_query, functions_description=functions_description, parameter_options=parameter_options)
    model_name = "gemini-2.0-flash"
    model_provider = "Gemini"
    pydantic_model = get_params_model(function_name)
    max_retries = 3
    result = call_llm(prompt, model_name, model_provider, pydantic_model, max_retries)
    
    return result

def final_answer_agent(user_query: str, retrieved_data: Any):
    final_answer_template = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are data analyst specializing in NYC Congestion Relief Zone data.
                """,
            ),
            (
                "human",
                """You are given a task to retrieve data from NYC Congestion Relief Zone data. User is asking for {user_query} 
                To answer the user's query, you have retrieved the following data: {retrieved_data}
                """,
            ),
        ]
    )
    prompt = final_answer_template.format(user_query=user_query, retrieved_data=retrieved_data)
    model_name = "gemini-2.0-flash"
    model_provider = "Gemini"
    pydantic_model = FinalAnswer
    max_retries = 3
    return call_llm(prompt, model_name, model_provider, pydantic_model, max_retries)
