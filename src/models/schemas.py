from pydantic import BaseModel, Field
from typing import List, Dict, Any, Type

class FunctionParams:
    """Container for all function parameter models"""
    
    class FilterCRZDataParams(BaseModel):
        """Parameters for filter_crz_data function"""
        start_date: str | None = None
        end_date: str | None = None
        day_type: str | None = None
        hour_range: List[int] | None = None  # Changed from Tuple to List
        time_period: str | None = None
        vehicle_class: str | None = None
        entry_point: str | None = None
        entry_region: str | None = None
    
    class AnalyzeEntryPointVolumeParams(BaseModel):
        """Parameters for analyze_entry_point_volume function"""
        start_date: str | None = None
        end_date: str | None = None
        day_type: str | None = None
        hour_range: List[int] | None = None  # Changed from Tuple to List
        time_period: str | None = None
        vehicle_class: str | None = None
        entry_point: str | None = None
        entry_region: str | None = None
        top_n: int | None = 10
        include_excluded_roadways: bool | None = False
    
    class AnalyzePeakPeriodsParams(BaseModel):
        """Parameters for analyze_peak_periods function"""
        start_date: str | None = None
        end_date: str | None = None
        day_type: str | None = None
        hour_range: List[int] | None = None
        time_period: str | None = None
        vehicle_class: str | None = None
        entry_point: str | None = None
        entry_region: str | None = None
        granularity: str | None = "hour"
        top_n: int | None = 5
    
    class AnalyzeVehicleDistributionParams(BaseModel):
        """Parameters for analyze_vehicle_distribution function"""
        start_date: str | None = None
        end_date: str | None = None
        day_type: str | None = None
        hour_range: List[int] | None = None 
        time_period: str | None = None
        vehicle_class: str | None = None
        entry_point: str | None = None
        entry_region: str | None = None
        compare_with: List[str] | None = Field(None,
        description="a list of names for comparison periods"
    )
    
    class AnalyzeTimeTrendsParams(BaseModel):
        """Parameters for analyze_time_trends function"""
        start_date: str | None = None
        end_date: str | None = None
        day_type: str | None = None
        hour_range: List[int] | None = None 
        time_period: str | None = None
        vehicle_class: str | None = None
        entry_point: str | None = None
        entry_region: str | None = None
        metric: str | None = "CRZ Entries"
        time_unit: str | None = "day"
    
    class AnalyzeExcludedRoadwayUsageParams(BaseModel):
        """Parameters for analyze_excluded_roadway_usage function"""
        start_date: str | None = None
        end_date: str | None = None
        day_type: str | None = None
        hour_range: List[int] | None = None  # Changed from Tuple to List
        time_period: str | None = None
        vehicle_class: str | None = None
        entry_point: str | None = None
        entry_region: str | None = None
    
    class AnalyzeVehiclePatternsParams(BaseModel):
        """Parameters for analyze_vehicle_patterns function"""
        start_date: str | None = None
        end_date: str | None = None
        day_type: str | None = None
        hour_range: List[int] | None = None  # Changed from Tuple to List
        time_period: str | None = None
        vehicle_class: str  # Required field
        entry_point: str | None = None
        entry_region: str | None = None
    
    class CompareTrafficSegmentsParams(BaseModel):
        """Parameters for compare_traffic_segments function"""
        dimension: str  # Required field
        segment_a: Dict[str, Any]  # Required field
        segment_b: Dict[str, Any]  # Required field
        metric: str | None = "CRZ Entries"
    
    class GenerateVisualizationParams(BaseModel):
        """Parameters for generate_visualization function"""
        start_date: str | None = None
        end_date: str | None = None
        day_type: str | None = None
        hour_range: List[int] | None = None  # Changed from Tuple to List
        time_period: str | None = None
        vehicle_class: str | None = None
        entry_point: str | None = None
        entry_region: str | None = None
        chart_type: str  # Required field
        x_column: str  # Required field
        y_column: str  # Required field
        title: str | None = "Congestion Relief Zone Analysis"
        
    class AnalyzeRegionalTrafficFlowParams(BaseModel):
        """Parameters for analyze_regional_traffic_flow function"""
        start_date: str | None = None
        end_date: str | None = None
        day_type: str | None = None
        hour_range: List[int] | None = None  # Changed from Tuple to List
        time_period: str | None = None
        vehicle_class: str | None = None
        source_region: str | None = None
        destination_region: str | None = None
        top_n: int | None = 5
        include_time_variation: bool | None = False
        
    class ForecastCongestionParams(BaseModel):
        """Parameters for forecast_congestion function"""
        forecast_date: str | None = None
        forecast_day_type: str | None = None
        forecast_hour: int | None = None
        region: str | None = None
        entry_point: str | None = None
        vehicle_class: str | None = None
        lookback_days: int | None = 30
        use_historical_trends: bool | None = True

# State definitions
class Reception(BaseModel):
    """Schema for understanding user queries about Congestion Relief Zone data"""
    response: str = Field(
        description="The response to the user's query, in a concise and informative manner"
    )
    retrieve_data: bool = Field(
        description="do we need to retrieve data from the dataset to answer the user's query"
    )
    data_description: str = Field(
        description="a description of the data needed to be retrieved from the dataset to answer the user's query"
    )


    
class FindFunction(BaseModel):
    response: str = Field(
        description="The response to the user's query, in a concise and informative manner"
    )
    data_available: bool = Field(
        description="do we have the data needed to answer the user's query"
    )
    function_name: str = Field(
        description="the name of the function to call to retrieve the data"
    )
    
class FinalAnswer(BaseModel):
    response: str = Field(
        description="The response to the user's query, in a concise and informative manner"
    )

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
    },
    {
      "function_name": "analyze_regional_traffic_flow",
      "description": "Analyze traffic flows between different regions in the Congestion Relief Zone",
      "required_parameters": [],
      "optional_parameters": [
        "start_date", "end_date", "day_type", "hour_range", "time_period", 
        "vehicle_class", "source_region", "destination_region", "top_n", "include_time_variation"
      ],
      "returns": "Dictionary with regional traffic flow analysis"
    },
    {
      "function_name": "forecast_congestion",
      "description": "Forecast traffic congestion based on historical patterns and trends",
      "required_parameters": [],
      "optional_parameters": [
        "forecast_date", "forecast_day_type", "forecast_hour", "region", 
        "entry_point", "vehicle_class", "lookback_days", "use_historical_trends"
      ],
      "returns": "Dictionary with congestion forecast and analysis"
    }
  ]
}


# JSON object with parameter options for each function
dataset_parameters = {
    "general_parameters": {
        "day_type": [
            "weekday", "weekend", "Monday", "Tuesday", "Wednesday", 
            "Thursday", "Friday", "Saturday", "Sunday"
        ],
        "time_period": ["Peak", "Overnight"],
        "vehicle_class": [
            "1 - Passenger Vehicle", 
            "2 - Commercial Vehicle", 
            "3 - Small Truck", 
            "4 - Large Truck", 
            "5 - Bus", 
            "TLC Taxi/FHV"
        ],
        "metric": ["CRZ Entries", "Excluded Roadway Entries"],
        "time_unit": ["hour", "day", "day_of_week", "week", "month"],
        "granularity": ["hour", "day_of_week", "date", "10_minute"]
    },
    
    "filter_crz_data": {
        "start_date": "YYYY-MM-DD format",
        "end_date": "YYYY-MM-DD format",
        "day_type": ["weekday", "weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "hour_range": "List of two integers from 0-23, e.g. [6, 10]",
        "time_period": ["Peak", "Overnight"],
        "vehicle_class": [
            "1 - Passenger Vehicle", 
            "2 - Commercial Vehicle", 
            "3 - Small Truck", 
            "4 - Large Truck", 
            "5 - Bus", 
            "TLC Taxi/FHV"
        ],
        "entry_point": "Detection Group values from dataset",
        "entry_region": "Detection Region values from dataset"
    },
    
    "analyze_entry_point_volume": {
        "start_date": "YYYY-MM-DD format",
        "end_date": "YYYY-MM-DD format",
        "day_type": ["weekday", "weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "hour_range": "List of two integers from 0-23, e.g. [6, 10]",
        "time_period": ["Peak", "Overnight"],
        "vehicle_class": [
            "1 - Passenger Vehicle", 
            "2 - Commercial Vehicle", 
            "3 - Small Truck", 
            "4 - Large Truck", 
            "5 - Bus", 
            "TLC Taxi/FHV"
        ],
        "top_n": "Integer, default is 10",
        "include_excluded_roadways": ["True", "False"]
    },
    
    "analyze_peak_periods": {
        "start_date": "YYYY-MM-DD format",
        "end_date": "YYYY-MM-DD format",
        "day_type": ["weekday", "weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "vehicle_class": [
            "1 - Passenger Vehicle", 
            "2 - Commercial Vehicle", 
            "3 - Small Truck", 
            "4 - Large Truck", 
            "5 - Bus", 
            "TLC Taxi/FHV"
        ],
        "entry_point": "Detection Group values from dataset",
        "entry_region": "Detection Region values from dataset",
        "granularity": ["hour", "day_of_week", "date", "10_minute"],
        "top_n": "Integer, default is 5"
    },
    
    "analyze_vehicle_distribution": {
        "start_date": "YYYY-MM-DD format",
        "end_date": "YYYY-MM-DD format",
        "day_type": ["weekday", "weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "hour_range": "List of two integers from 0-23, e.g. [6, 10]",
        "time_period": ["Peak", "Overnight"],
        "entry_point": "Detection Group values from dataset",
        "entry_region": "Detection Region values from dataset",
        "compare_with": [
            "weekday", "weekend", "monday", "tuesday", "wednesday", "thursday", "friday", 
            "saturday", "sunday", "morning", "afternoon", "evening", "night", "rush_hour", 
            "peak", "overnight", "passenger", "commercial", "truck", "large_truck", "bus", "taxi"
        ]
    },
    
    "analyze_time_trends": {
        "start_date": "YYYY-MM-DD format",
        "end_date": "YYYY-MM-DD format",
        "day_type": ["weekday", "weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "hour_range": "List of two integers from 0-23, e.g. [6, 10]",
        "time_period": ["Peak", "Overnight"],
        "vehicle_class": [
            "1 - Passenger Vehicle", 
            "2 - Commercial Vehicle", 
            "3 - Small Truck", 
            "4 - Large Truck", 
            "5 - Bus", 
            "TLC Taxi/FHV"
        ],
        "entry_point": "Detection Group values from dataset",
        "entry_region": "Detection Region values from dataset",
        "metric": ["CRZ Entries", "Excluded Roadway Entries"],
        "time_unit": ["hour", "day", "day_of_week", "week", "month"]
    },
    
    "analyze_excluded_roadway_usage": {
        "start_date": "YYYY-MM-DD format",
        "end_date": "YYYY-MM-DD format",
        "day_type": ["weekday", "weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "hour_range": "List of two integers from 0-23, e.g. [6, 10]",
        "time_period": ["Peak", "Overnight"],
        "vehicle_class": [
            "1 - Passenger Vehicle", 
            "2 - Commercial Vehicle", 
            "3 - Small Truck", 
            "4 - Large Truck", 
            "5 - Bus", 
            "TLC Taxi/FHV"
        ],
        "entry_region": "Detection Region values from dataset"
    },
    
    "compare_traffic_segments": {
        "dimension": ["time", "vehicle", "location"],
        "segment_a": "Dictionary of filter parameters",
        "segment_b": "Dictionary of filter parameters",
        "metric": ["CRZ Entries", "Excluded Roadway Entries"]
    },
    
    "analyze_regional_traffic_flow": {
        "start_date": "YYYY-MM-DD format",
        "end_date": "YYYY-MM-DD format",
        "day_type": ["weekday", "weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "hour_range": "List of two integers from 0-23, e.g. [6, 10]",
        "time_period": ["Peak", "Overnight"],
        "vehicle_class": [
            "1 - Passenger Vehicle", 
            "2 - Commercial Vehicle", 
            "3 - Small Truck", 
            "4 - Large Truck", 
            "5 - Bus", 
            "TLC Taxi/FHV"
        ],
        "source_region": "Detection Region values from dataset",
        "destination_region": "Detection Region values from dataset",
        "top_n": "Integer, default is 5",
        "include_time_variation": ["True", "False"]
    },
    
    "forecast_congestion": {
        "forecast_date": "YYYY-MM-DD format",
        "forecast_day_type": ["weekday", "weekend", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "forecast_hour": "Integer from 0-23",
        "region": "Detection Region values from dataset",
        "entry_point": "Detection Group values from dataset",
        "vehicle_class": [
            "1 - Passenger Vehicle", 
            "2 - Commercial Vehicle", 
            "3 - Small Truck", 
            "4 - Large Truck", 
            "5 - Bus", 
            "TLC Taxi/FHV"
        ],
        "lookback_days": "Integer, default is 30",
        "use_historical_trends": ["True", "False"]
    }
}