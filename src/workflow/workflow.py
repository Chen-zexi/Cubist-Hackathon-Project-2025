import sys
import os

from src.workflow.agents import reception_agent, function_selection_agent, data_retrieval_agent, final_answer_agent
import json
from typing import Any
from src.workflow.other_tools import execute_crz_function
from src.utils.data_loader import load_and_process_data
from src.models.schemas import functions_info
import warnings
warnings.filterwarnings('ignore')


def run_workflow(user_query: str):
    file_path = "data/MTA_Congestion_Relief_Zone_Vehicle_Entries__Beginning_2025_20250404.csv"
    df, aggregations = load_and_process_data(file_path)
    reception_response = reception_agent(user_query)
    print("\n\nReception Response:")
    print(reception_response)
    function_selection_response = function_selection_agent(user_query, reception_response.data_description, functions_info)
    print("\n\nFunction Selection Response:")
    print(function_selection_response)
    data_retrieval_response = data_retrieval_agent(user_query, function_selection_response.function_name)
    print("\n\nData Retrieval Response:")
    print(data_retrieval_response)
    data_retrieval_response = execute_crz_function(function_name=function_selection_response.function_name, params=data_retrieval_response, df=df)
    final_answer_response = final_answer_agent(user_query, data_retrieval_response)
    print("\n\nFinal Answer:")
    print(final_answer_response)

if __name__ == "__main__":
    run_workflow("What is the total number of vehicles that entered the CRZ in the last 30 days?")