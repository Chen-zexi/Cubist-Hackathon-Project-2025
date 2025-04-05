from typing import Type
from src.models.schemas import FunctionParams, dataset_parameters
from src.workflow.tools import filter_crz_data, analyze_entry_point_volume, analyze_peak_periods, analyze_vehicle_distribution, analyze_time_trends, analyze_excluded_roadway_usage, compare_traffic_segments, analyze_regional_traffic_flow, forecast_congestion

import pandas as pd
from pydantic import BaseModel

def get_params_model(function_name: str) -> Type[BaseModel]:
    """
    Returns the appropriate Pydantic model based on the function name
    
    Args:
        function_name: Name of the function
        
    Returns:
        The corresponding Pydantic model class
        
    Raises:
        ValueError: If the function name is not recognized
    """
    model_mapping = {
        "filter_crz_data": FunctionParams.FilterCRZDataParams,
        "analyze_entry_point_volume": FunctionParams.AnalyzeEntryPointVolumeParams,
        "analyze_peak_periods": FunctionParams.AnalyzePeakPeriodsParams,
        "analyze_vehicle_distribution": FunctionParams.AnalyzeVehicleDistributionParams,
        "analyze_time_trends": FunctionParams.AnalyzeTimeTrendsParams,
        "analyze_excluded_roadway_usage": FunctionParams.AnalyzeExcludedRoadwayUsageParams,
        "analyze_vehicle_patterns": FunctionParams.AnalyzeVehiclePatternsParams,
        "compare_traffic_segments": FunctionParams.CompareTrafficSegmentsParams,
        "generate_visualization": FunctionParams.GenerateVisualizationParams,
        "analyze_regional_traffic_flow": FunctionParams.AnalyzeRegionalTrafficFlowParams,
        "forecast_congestion": FunctionParams.ForecastCongestionParams
    }
    
    if function_name not in model_mapping:
        raise ValueError(f"Unknown function name: {function_name}")
    
    return model_mapping[function_name]

def find_function_description(function_name: str) -> str:
    for function in functions_info['functions']:
        if function['function_name'] == function_name:
            return function
    return "Function not found"

def convert_list_to_tuple(params_dict: dict) -> dict:
    """
    Convert lists to tuples in the parameters dictionary where needed
    
    Args:
        params_dict: Dictionary of parameters from LLM response
        
    Returns:
        Dictionary with lists converted to tuples where appropriate
    """
    result = params_dict.model_copy()
    
    # Convert hour_range from list to tuple if it exists and is a list
    if 'hour_range' in result and result['hour_range'] is not None:
        if isinstance(result['hour_range'], list) and len(result['hour_range']) == 2:
            result['hour_range'] = tuple(result['hour_range'])
    
    # Handle nested dictionaries like segment_a and segment_b
    for key in ['segment_a', 'segment_b', 'compare_with']:
        if key in result and isinstance(result[key], dict):
            result[key] = convert_list_to_tuple(result[key])
    
    return result


functions_info = {
  "functions": [
    {
      "function_name": "filter_crz_data",
      "description": "Filter the CRZ dataset by multiple parameters",
      "required_parameters": [],
      "optional_parameters": [
        "start_date", "end_date", "day_type", "hour_range", "time_period", 
        "vehicle_class", "entry_point", "entry_region"
      ],
      "returns": "Filtered dataframe for further analysis"
    },
    {
      "function_name": "analyze_entry_point_volume",
      "description": "Analyze traffic volumes for different entry points",
      "required_parameters": [],
      "optional_parameters": [
        "start_date", "end_date", "day_type", "hour_range", "time_period", 
        "vehicle_class", "top_n", "include_excluded_roadways"
      ],
      "returns": "Dictionary with top entry points by volume and percentage"
    },
    {
      "function_name": "analyze_peak_periods",
      "description": "Identify peak traffic periods at different time granularities",
      "required_parameters": [],
      "optional_parameters": [
        "start_date", "end_date", "day_type", "vehicle_class", "entry_point", 
        "entry_region", "granularity", "top_n"
      ],
      "returns": "Dictionary with peak periods and volumes"
    },
    {
      "function_name": "analyze_vehicle_distribution",
      "description": "Analyze distribution of traffic by vehicle type",
      "required_parameters": [],
      "optional_parameters": [
        "start_date", "end_date", "day_type", "hour_range", "time_period", 
        "entry_point", "entry_region", "compare_with"
      ],
      "returns": "Dictionary with vehicle distribution breakdown"
    },
    {
      "function_name": "analyze_time_trends",
      "description": "Analyze traffic trends over time",
      "required_parameters": [],
      "optional_parameters": [
        "start_date", "end_date", "day_type", "vehicle_class", "entry_point", 
        "entry_region", "metric", "time_unit"
      ],
      "returns": "Dictionary with time series data and trend statistics"
    },
    {
      "function_name": "analyze_excluded_roadway_usage",
      "description": "Analyze usage patterns of excluded roadways vs. congestion zone",
      "required_parameters": [],
      "optional_parameters": [
        "start_date", "end_date", "day_type", "hour_range", "time_period", 
        "vehicle_class", "entry_region"
      ],
      "returns": "Dictionary with excluded roadway usage analysis"
    },
    {
      "function_name": "analyze_vehicle_patterns",
      "description": "Analyze traffic patterns for a specific vehicle class",
      "required_parameters": ["vehicle_class"],
      "optional_parameters": [
        "start_date", "end_date", "day_type", "hour_range", "time_period", 
        "entry_point", "entry_region"
      ],
      "returns": "Dictionary with vehicle pattern analysis including time and location patterns"
    },
    {
      "function_name": "compare_traffic_segments",
      "description": "Compare traffic patterns between two segments",
      "required_parameters": ["dimension", "segment_a", "segment_b"],
      "optional_parameters": ["metric"],
      "returns": "Dictionary with comparison results between segments"
    },
    {
      "function_name": "generate_visualization",
      "description": "Generate a visualization based on the data",
      "required_parameters": ["chart_type", "x_column", "y_column"],
      "optional_parameters": [
        "title", "start_date", "end_date", "day_type", "hour_range", 
        "time_period", "vehicle_class", "entry_point", "entry_region"
      ],
      "returns": "Path to saved visualization or visualization code"
    }
  ]
}

def execute_crz_function(function_name: str, params: BaseModel, df: pd.DataFrame):
    """
    Execute the appropriate CRZ analysis function based on the function name and parameters
    
    Args:
        function_name: Name of the function to call
        params: Pydantic model instance containing the function parameters
        df: DataFrame containing the CRZ data
        
    Returns:
        Result of the function call
    """
    # Convert Pydantic model to dictionary
    params_dict = params.model_dump(exclude_none=True)
    
    # Handle hour_range conversion from list to tuple if needed
    if 'hour_range' in params_dict and isinstance(params_dict['hour_range'], list):
        params_dict['hour_range'] = tuple(params_dict['hour_range'])
    
    # Map function names to their implementations
    function_mapping = {
        "filter_crz_data": filter_crz_data,
        "analyze_entry_point_volume": analyze_entry_point_volume,
        "analyze_peak_periods": analyze_peak_periods, 
        "analyze_vehicle_distribution": analyze_vehicle_distribution,
        "analyze_time_trends": analyze_time_trends,
        "analyze_excluded_roadway_usage": analyze_excluded_roadway_usage,
        #"analyze_vehicle_patterns": analyze_vehicle_patterns,
        "compare_traffic_segments": compare_traffic_segments,
        "analyze_regional_traffic_flow": analyze_regional_traffic_flow,
        "forecast_congestion": forecast_congestion,
    }
    
    # Verify function exists
    if function_name not in function_mapping:
        raise ValueError(f"Unknown function: {function_name}")
    
    # Get the function
    func = function_mapping[function_name]
    
    # Special handling for compare_traffic_segments which has nested parameters
    if function_name == "compare_traffic_segments":
        # Need to process nested segment_a and segment_b dictionaries
        if 'segment_a' in params_dict:
            for key, value in params_dict['segment_a'].items():
                if key == 'hour_range' and isinstance(value, list):
                    params_dict['segment_a'][key] = tuple(value)
                    
        if 'segment_b' in params_dict:
            for key, value in params_dict['segment_b'].items():
                if key == 'hour_range' and isinstance(value, list):
                    params_dict['segment_b'][key] = tuple(value)
    
    # Check if there are any parameters in params_dict that are not expected by func
    import inspect
    valid_params = set(inspect.signature(func).parameters.keys())
    # 'df' is always a valid parameter
    valid_params.add('df')
    
    # Filter out invalid parameters
    filtered_params = {k: v for k, v in params_dict.items() if k in valid_params}
    
    # If parameters were filtered out, log it
    if set(params_dict.keys()) != set(filtered_params.keys()):
        removed_params = set(params_dict.keys()) - set(filtered_params.keys())
        print(f"Warning: The following parameters are not accepted by {function_name} and will be ignored: {removed_params}")
    
    # Call the function with the dataframe and parameters
    try:
        # Always pass the dataframe as the first argument
        result = func(df, **filtered_params)
        return result
    except TypeError as e:
        # If we get a TypeError, it might be due to unexpected parameters
        # Log the error and re-raise with more helpful message
        print(f"Error calling {function_name}: {e}")
        print(f"Parameters provided: {filtered_params}")
        raise ValueError(f"Error calling {function_name} with the provided parameters: {e}")
    
    
def get_parameter_options(function_name):
    """
    Get parameter options for a specific function
    
    Parameters:
    -----------
    function_name : str
        Name of the function to get parameter options for
        
    Returns:
    --------
    dict
        Dictionary containing parameter options for the specified function
    """
    # Get all parameters for the function
    all_params = dataset_parameters.get(function_name, {})
    
    # If function not found, check if it's in the general_parameters
    if not all_params and function_name not in dataset_parameters:
        return {"error": f"Function {function_name} not found in parameters"}
    
    # Return parameters for the function
    return all_params