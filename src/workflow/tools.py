import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def filter_crz_data(df, 
                   start_date=None, 
                   end_date=None, 
                   day_type=None,  # 'weekday', 'weekend', or specific day name
                   hour_range=None,  # tuple (start_hour, end_hour)
                   time_period=None,  # 'Peak' or 'Overnight'
                   vehicle_class=None,  # int or string for vehicle class
                   entry_point=None,  # specific entry point
                   entry_region=None):  # specific region
    """
    Filter the CRZ dataset by multiple parameters
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The MTA CRZ dataset
    start_date : str, optional
        Start date in 'YYYY-MM-DD' format
    end_date : str, optional
        End date in 'YYYY-MM-DD' format
    day_type : str, optional
        'weekday', 'weekend', or specific day name (e.g., 'Monday')
    hour_range : tuple, optional
        (start_hour, end_hour) - integers from 0-23
    time_period : str, optional
        'Peak' or 'Overnight'
    vehicle_class : str or int, optional
        Vehicle class (1-5 or 'TLC Taxi/FHV')
    entry_point : str, optional
        Specific entry point (Detection Group)
    entry_region : str, optional
        Specific region (Detection Region)
        
    Returns:
    --------
    pandas.DataFrame
        Filtered dataframe
    """
    filtered_df = df.copy()
    
    # Date filtering
    if start_date:
        filtered_df = filtered_df[filtered_df['Toll Date'] >= pd.to_datetime(start_date)]
    if end_date:
        filtered_df = filtered_df[filtered_df['Toll Date'] <= pd.to_datetime(end_date)]
    
    # Day type filtering
    if day_type:
        if day_type.lower() == 'weekday':
            # Monday(2) to Friday(6)
            filtered_df = filtered_df[filtered_df['Day of Week Int'].between(2, 6)]
        elif day_type.lower() == 'weekend':
            # Saturday(7) and Sunday(1)
            filtered_df = filtered_df[filtered_df['Day of Week Int'].isin([1, 7])]
        else:
            # Specific day
            filtered_df = filtered_df[filtered_df['Day of Week'] == day_type]
    
    # Hour range filtering
    if hour_range and len(hour_range) == 2:
        start_hour, end_hour = hour_range
        if start_hour <= end_hour:
            filtered_df = filtered_df[filtered_df['Hour of Day'].between(start_hour, end_hour)]
        else:
            # Handle overnight ranges (e.g., 22-6)
            filtered_df = filtered_df[(filtered_df['Hour of Day'] >= start_hour) | 
                                     (filtered_df['Hour of Day'] <= end_hour)]
    
    # Time period filtering
    if time_period:
        filtered_df = filtered_df[filtered_df['Time Period'] == time_period]
    
    # Vehicle class filtering
    if vehicle_class:
        # Handle both numeric and text representations
        if isinstance(vehicle_class, int) or vehicle_class.isdigit():
            class_num = int(vehicle_class)
            filtered_df = filtered_df[filtered_df['Vehicle Class'].str.startswith(f"{class_num} -")]
        else:
            filtered_df = filtered_df[filtered_df['Vehicle Class'] == vehicle_class]
    
    # Entry point filtering
    if entry_point:
        filtered_df = filtered_df[filtered_df['Detection Group'] == entry_point]
    
    # Region filtering
    if entry_region:
        filtered_df = filtered_df[filtered_df['Detection Region'] == entry_region]
    
    return filtered_df

def analyze_entry_point_volume(df, 
                              top_n=10, 
                              start_date=None, 
                              end_date=None,
                              day_type=None, 
                              hour_range=None,
                              time_period=None,
                              vehicle_class=None,
                              include_excluded_roadways=False):
    """
    Analyze traffic volumes for different entry points with customizable filters
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The MTA CRZ dataset
    top_n : int, optional
        Number of top entry points to return
    [filtering parameters as in filter_crz_data]
    include_excluded_roadways : bool, optional
        Whether to include entries on excluded roadways in the analysis
        
    Returns:
    --------
    dict
        Entry point analysis results including:
        - top_entry_points: List of top entry points with volume and percentage
        - total_volume: Total entry volume in the filtered dataset
        - filter_summary: Summary of applied filters
    """
    # Apply filters
    filtered_df = filter_crz_data(df, 
                                 start_date=start_date, 
                                 end_date=end_date,
                                 day_type=day_type, 
                                 hour_range=hour_range,
                                 time_period=time_period,
                                 vehicle_class=vehicle_class)
    
    # Group by entry point
    if include_excluded_roadways:
        # Sum both CRZ and Excluded Roadway entries
        entry_volumes = filtered_df.groupby('Detection Group').agg({
            'CRZ Entries': 'sum',
            'Excluded Roadway Entries': 'sum'
        })
        entry_volumes['Total Entries'] = entry_volumes['CRZ Entries'] + entry_volumes['Excluded Roadway Entries']
        volume_col = 'Total Entries'
    else:
        # Only count CRZ entries
        entry_volumes = filtered_df.groupby('Detection Group').agg({
            'CRZ Entries': 'sum'
        })
        volume_col = 'CRZ Entries'
    
    # Sort and get top N
    top_entries = entry_volumes.sort_values(volume_col, ascending=False).head(top_n)
    
    # Calculate percentages
    total_volume = entry_volumes[volume_col].sum()
    top_entries['Percentage'] = (top_entries[volume_col] / total_volume * 100).round(1)
    
    # Create region mapping for context
    region_mapping = filtered_df.drop_duplicates('Detection Group').set_index('Detection Group')['Detection Region']
    
    # Prepare results
    results = {
        'top_entry_points': [
            {
                'entry_point': entry,
                'region': region_mapping.get(entry, 'Unknown'),
                'volume': int(row[volume_col]),
                'percentage': float(row['Percentage'])
            }
            for entry, row in top_entries.iterrows()
        ],
        'total_volume': int(total_volume),
        'filter_summary': {
            'date_range': f"{filtered_df['Toll Date'].min().strftime('%Y-%m-%d')} to {filtered_df['Toll Date'].max().strftime('%Y-%m-%d')}" if not filtered_df.empty else "No data",
            'day_type': day_type if day_type else "All days",
            'hour_range': f"{hour_range[0]}:00 to {hour_range[1]}:00" if hour_range else "All hours",
            'time_period': time_period if time_period else "All periods",
            'vehicle_class': vehicle_class if vehicle_class else "All vehicles",
            'entry_count': len(filtered_df['Detection Group'].unique())
        }
    }
    
    return results

def analyze_peak_periods(df, 
                        granularity='hour', 
                        top_n=5,
                        start_date=None, 
                        end_date=None,
                        day_type=None, 
                        vehicle_class=None,
                        entry_point=None,
                        entry_region=None):
    """
    Identify peak traffic periods at different time granularities
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The MTA CRZ dataset
    granularity : str, optional
        Time granularity: 'hour', 'day_of_week', 'date', '10_minute'
    top_n : int, optional
        Number of peak periods to return
    [filtering parameters as in filter_crz_data]
        
    Returns:
    --------
    dict
        Peak period analysis including:
        - peak_periods: List of peak periods with volume
        - peak_to_average_ratio: Ratio of peak volume to average volume
        - total_volume: Total entry volume in the filtered dataset
        - filter_summary: Summary of applied filters
    """
    # Apply filters
    filtered_df = filter_crz_data(df, 
                                 start_date=start_date, 
                                 end_date=end_date,
                                 day_type=day_type,
                                 vehicle_class=vehicle_class,
                                 entry_point=entry_point,
                                 entry_region=entry_region)
    
    # Group by chosen time granularity
    if granularity == 'hour':
        grouped = filtered_df.groupby('Hour of Day')['CRZ Entries'].sum().reset_index()
        label_formatter = lambda x: f"{int(x):02d}:00"
    
    elif granularity == 'day_of_week':
        # Order by actual day sequence (Monday to Sunday)
        day_order = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 
                    'Friday': 4, 'Saturday': 5, 'Sunday': 6}
        grouped = filtered_df.groupby('Day of Week')['CRZ Entries'].sum().reset_index()
        # Add ordering column and sort
        grouped['day_order'] = grouped['Day of Week'].map(day_order)
        grouped = grouped.sort_values('day_order')
        grouped = grouped.drop('day_order', axis=1)
        label_formatter = lambda x: x
    
    elif granularity == 'date':
        grouped = filtered_df.groupby('Toll Date')['CRZ Entries'].sum().reset_index()
        label_formatter = lambda x: x.strftime('%Y-%m-%d')
    
    elif granularity == '10_minute':
        # Create a combined hour-minute column
        filtered_df['time_block'] = filtered_df['Hour of Day'].astype(str) + ':' + filtered_df['Minute of Hour'].astype(str)
        grouped = filtered_df.groupby('time_block')['CRZ Entries'].sum().reset_index()
        label_formatter = lambda x: x
    
    else:
        raise ValueError(f"Unsupported granularity: {granularity}")
    
    # Sort by volume and get top peaks
    grouped = grouped.sort_values('CRZ Entries', ascending=False)
    top_periods = grouped.head(top_n)
    
    # Calculate average and peak-to-average ratio
    average_volume = grouped['CRZ Entries'].mean()
    peak_volume = grouped['CRZ Entries'].max()
    peak_to_avg_ratio = peak_volume / average_volume if average_volume > 0 else 0
    
    # Prepare results
    if granularity == 'hour':
        x_label = 'hour'
        x_value_col = 'Hour of Day'
    elif granularity == 'day_of_week':
        x_label = 'day'
        x_value_col = 'Day of Week'
    elif granularity == 'date':
        x_label = 'date'
        x_value_col = 'Toll Date'
    else:
        x_label = 'time_block'
        x_value_col = 'time_block'
    
    results = {
        'peak_periods': [
            {
                x_label: label_formatter(row[x_value_col]),
                'volume': int(row['CRZ Entries']),
                'percentage_of_total': float(row['CRZ Entries'] / grouped['CRZ Entries'].sum() * 100)
            }
            for _, row in top_periods.iterrows()
        ],
        'peak_to_average_ratio': float(peak_to_avg_ratio),
        'average_volume': float(average_volume),
        'total_volume': int(grouped['CRZ Entries'].sum()),
        'filter_summary': {
            'granularity': granularity,
            'date_range': f"{filtered_df['Toll Date'].min().strftime('%Y-%m-%d')} to {filtered_df['Toll Date'].max().strftime('%Y-%m-%d')}" if not filtered_df.empty else "No data",
            'day_type': day_type if day_type else "All days",
            'vehicle_class': vehicle_class if vehicle_class else "All vehicles",
            'entry_point': entry_point if entry_point else "All entry points",
            'entry_region': entry_region if entry_region else "All regions"
        }
    }
    
    return results

def analyze_vehicle_distribution(df,
                               start_date=None, 
                               end_date=None,
                               day_type=None, 
                               hour_range=None,
                               time_period=None,
                               entry_point=None,
                               entry_region=None,
                               compare_with=None):  # For comparison with another time period
    """
    Analyze distribution of traffic by vehicle type with optional comparison
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The MTA CRZ dataset
    [filtering parameters as in filter_crz_data]
    compare_with : dict, optional
        Dictionary with filter parameters for comparison period
        
    Returns:
    --------
    dict
        Vehicle distribution analysis including:
        - vehicle_distribution: Breakdown by vehicle type
        - total_volume: Total entry volume
        - comparison: Optional comparison with another time period
        - filter_summary: Summary of applied filters
    """
    # Apply filters for main period
    filtered_df = filter_crz_data(df, 
                                 start_date=start_date, 
                                 end_date=end_date,
                                 day_type=day_type, 
                                 hour_range=hour_range,
                                 time_period=time_period,
                                 entry_point=entry_point,
                                 entry_region=entry_region)
    
    # Group by vehicle class
    vehicle_counts = filtered_df.groupby('Vehicle Class')['CRZ Entries'].sum().reset_index()
    
    # Calculate percentages
    total_volume = vehicle_counts['CRZ Entries'].sum()
    vehicle_counts['Percentage'] = (vehicle_counts['CRZ Entries'] / total_volume * 100).round(1)
    
    # Sort by volume
    vehicle_counts = vehicle_counts.sort_values('CRZ Entries', ascending=False)
    
    # Prepare comparison if requested
    comparison_data = None
    if compare_with:
        # Apply filters for comparison period
        comp_df = filter_crz_data(df, **compare_with)
        
        # Group by vehicle class
        comp_counts = comp_df.groupby('Vehicle Class')['CRZ Entries'].sum().reset_index()
        
        # Calculate percentages
        comp_total = comp_counts['CRZ Entries'].sum()
        comp_counts['Percentage'] = (comp_counts['CRZ Entries'] / comp_total * 100).round(1)
        
        # Create comparison dataset
        comparison_data = {
            'vehicle_distribution': [
                {
                    'vehicle_class': row['Vehicle Class'],
                    'volume': int(row['CRZ Entries']),
                    'percentage': float(row['Percentage'])
                }
                for _, row in comp_counts.sort_values('CRZ Entries', ascending=False).iterrows()
            ],
            'total_volume': int(comp_total),
            'filter_summary': {key: value for key, value in compare_with.items() if value is not None}
        }
    
    # Prepare results
    results = {
        'vehicle_distribution': [
            {
                'vehicle_class': row['Vehicle Class'],
                'volume': int(row['CRZ Entries']),
                'percentage': float(row['Percentage'])
            }
            for _, row in vehicle_counts.iterrows()
        ],
        'total_volume': int(total_volume),
        'filter_summary': {
            'date_range': f"{filtered_df['Toll Date'].min().strftime('%Y-%m-%d')} to {filtered_df['Toll Date'].max().strftime('%Y-%m-%d')}" if not filtered_df.empty else "No data",
            'day_type': day_type if day_type else "All days",
            'hour_range': f"{hour_range[0]}:00 to {hour_range[1]}:00" if hour_range else "All hours",
            'time_period': time_period if time_period else "All periods",
            'entry_point': entry_point if entry_point else "All entry points",
            'entry_region': entry_region if entry_region else "All regions"
        }
    }
    
    if comparison_data:
        results['comparison'] = comparison_data
    
    return results

def analyze_time_trends(df, 
                      metric='CRZ Entries',
                      time_unit='day',  # 'hour', 'day', 'week', 'month'
                      start_date=None, 
                      end_date=None,
                      day_type=None,
                      vehicle_class=None,
                      entry_point=None,
                      entry_region=None):
    """
    Analyze traffic trends over time with different aggregation levels
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The MTA CRZ dataset
    metric : str, optional
        Metric to analyze: 'CRZ Entries' or 'Excluded Roadway Entries'
    time_unit : str, optional
        Time unit for aggregation: 'hour', 'day', 'week', 'month'
    [filtering parameters as in filter_crz_data]
        
    Returns:
    --------
    dict
        Time trend analysis including:
        - time_series: List of time points with volumes
        - trend_stats: Statistics about the trend (growth rate, etc.)
        - filter_summary: Summary of applied filters
    """
    # Apply filters
    filtered_df = filter_crz_data(df, 
                                 start_date=start_date, 
                                 end_date=end_date,
                                 day_type=day_type,
                                 vehicle_class=vehicle_class,
                                 entry_point=entry_point,
                                 entry_region=entry_region)
    
    # Group by time unit
    if time_unit == 'hour':
        grouped = filtered_df.groupby('Hour of Day')[metric].sum().reset_index()
        x_label = 'hour'
        x_column = 'Hour of Day'
        formatter = lambda x: f"{int(x):02d}:00"
        
    elif time_unit == 'day':
        grouped = filtered_df.groupby('Toll Date')[metric].sum().reset_index()
        x_label = 'date'
        x_column = 'Toll Date'
        formatter = lambda x: x.strftime('%Y-%m-%d')
        
    elif time_unit == 'day_of_week':
        # Map days to numbers for proper ordering
        day_order = {'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
                    'Thursday': 4, 'Friday': 5, 'Saturday': 6}
        grouped = filtered_df.groupby('Day of Week')[metric].sum().reset_index()
        grouped['day_order'] = grouped['Day of Week'].map(day_order)
        grouped = grouped.sort_values('day_order')
        grouped = grouped.drop('day_order', axis=1)
        x_label = 'day'
        x_column = 'Day of Week'
        formatter = lambda x: x
        
    elif time_unit == 'week':
        grouped = filtered_df.groupby('Toll Week')[metric].sum().reset_index()
        x_label = 'week'
        x_column = 'Toll Week'
        formatter = lambda x: x.strftime('%Y-%m-%d')
        
    elif time_unit == 'month':
        # Create a month column if it doesn't exist
        if 'Month' not in filtered_df.columns and 'Toll Date' in filtered_df.columns:
            filtered_df['Month'] = filtered_df['Toll Date'].dt.to_period('M')
        grouped = filtered_df.groupby('Month')[metric].sum().reset_index()
        x_label = 'month'
        x_column = 'Month'
        formatter = lambda x: str(x)
        
    else:
        raise ValueError(f"Unsupported time unit: {time_unit}")
    
    # Calculate trend statistics
    if len(grouped) > 1 and time_unit in ['day', 'week', 'month']:
        # Sort chronologically for trend calculation
        grouped = grouped.sort_values(x_column)
        
        # Calculate growth metrics
        first_value = grouped[metric].iloc[0]
        last_value = grouped[metric].iloc[-1]
        total_growth = last_value - first_value
        percent_growth = (total_growth / first_value * 100) if first_value > 0 else 0
        
        # Calculate average daily change
        if time_unit == 'day':
            daily_changes = grouped[metric].diff().dropna()
            avg_daily_change = daily_changes.mean()
        else:
            avg_daily_change = None
            
        trend_stats = {
            'total_growth': float(total_growth),
            'percent_growth': float(percent_growth),
            'avg_daily_change': float(avg_daily_change) if avg_daily_change is not None else None,
            'min_value': float(grouped[metric].min()),
            'max_value': float(grouped[metric].max()),
            'std_dev': float(grouped[metric].std())
        }
    else:
        trend_stats = {
            'min_value': float(grouped[metric].min()) if not grouped.empty else 0,
            'max_value': float(grouped[metric].max()) if not grouped.empty else 0,
            'avg_value': float(grouped[metric].mean()) if not grouped.empty else 0
        }
    
    # Prepare time series data
    time_series = [
        {
            x_label: formatter(row[x_column]),
            'volume': int(row[metric])
        }
        for _, row in grouped.iterrows()
    ]
    
    # Prepare results
    results = {
        'time_series': time_series,
        'trend_stats': trend_stats,
        'metric': metric,
        'time_unit': time_unit,
        'total_volume': int(grouped[metric].sum()),
        'filter_summary': {
            'date_range': f"{filtered_df['Toll Date'].min().strftime('%Y-%m-%d')} to {filtered_df['Toll Date'].max().strftime('%Y-%m-%d')}" if not filtered_df.empty else "No data",
            'day_type': day_type if day_type else "All days",
            'vehicle_class': vehicle_class if vehicle_class else "All vehicles",
            'entry_point': entry_point if entry_point else "All entry points",
            'entry_region': entry_region if entry_region else "All regions"
        }
    }
    
    return results

def analyze_excluded_roadway_usage(df,
                                 start_date=None, 
                                 end_date=None,
                                 day_type=None, 
                                 hour_range=None,
                                 time_period=None,
                                 vehicle_class=None,
                                 entry_region=None):
    """
    Analyze usage patterns of excluded roadways vs. congestion zone
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The MTA CRZ dataset
    [filtering parameters as in filter_crz_data]
        
    Returns:
    --------
    dict
        Excluded roadway usage analysis including:
        - overall_usage: Breakdown of CRZ vs excluded roadway usage
        - by_entry_point: Usage breakdown by entry point
        - by_vehicle_class: Usage breakdown by vehicle class
        - by_time: Usage patterns by time
        - filter_summary: Summary of applied filters
    """
    # Apply filters
    filtered_df = filter_crz_data(df, 
                                 start_date=start_date, 
                                 end_date=end_date,
                                 day_type=day_type, 
                                 hour_range=hour_range,
                                 time_period=time_period,
                                 vehicle_class=vehicle_class,
                                 entry_region=entry_region)
    
    # Calculate overall usage
    total_crz = filtered_df['CRZ Entries'].sum()
    total_excluded = filtered_df['Excluded Roadway Entries'].sum()
    total_entries = total_crz + total_excluded
    
    # Usage by entry point
    entry_usage = filtered_df.groupby('Detection Group').agg({
        'CRZ Entries': 'sum',
        'Excluded Roadway Entries': 'sum'
    }).reset_index()
    
    # Calculate total and excluded percentage for each entry point
    entry_usage['Total'] = entry_usage['CRZ Entries'] + entry_usage['Excluded Roadway Entries']
    entry_usage['Excluded Percentage'] = (entry_usage['Excluded Roadway Entries'] / 
                                        entry_usage['Total'] * 100).round(1)
    
    # Sort by excluded percentage
    entry_usage = entry_usage.sort_values('Excluded Percentage', ascending=False)
    
    # Usage by vehicle class
    vehicle_usage = filtered_df.groupby('Vehicle Class').agg({
        'CRZ Entries': 'sum',
        'Excluded Roadway Entries': 'sum'
    }).reset_index()
    
    # Calculate total and excluded percentage for each vehicle class
    vehicle_usage['Total'] = vehicle_usage['CRZ Entries'] + vehicle_usage['Excluded Roadway Entries']
    vehicle_usage['Excluded Percentage'] = (vehicle_usage['Excluded Roadway Entries'] / 
                                         vehicle_usage['Total'] * 100).round(1)
    
    # Usage by time
    # Group by hour of day
    hourly_usage = filtered_df.groupby('Hour of Day').agg({
        'CRZ Entries': 'sum',
        'Excluded Roadway Entries': 'sum'
    }).reset_index()
    
    hourly_usage['Total'] = hourly_usage['CRZ Entries'] + hourly_usage['Excluded Roadway Entries']
    hourly_usage['Excluded Percentage'] = (hourly_usage['Excluded Roadway Entries'] / 
                                         hourly_usage['Total'] * 100).round(1)
    
    # Prepare results
    results = {
        'overall_usage': {
            'total_entries': int(total_entries),
            'crz_entries': int(total_crz),
            'excluded_entries': int(total_excluded),
            'excluded_percentage': float(total_excluded / total_entries * 100) if total_entries > 0 else 0
        },
        'by_entry_point': [
            {
                'entry_point': row['Detection Group'],
                'crz_entries': int(row['CRZ Entries']),
                'excluded_entries': int(row['Excluded Roadway Entries']),
                'total': int(row['Total']),
                'excluded_percentage': float(row['Excluded Percentage'])
            }
            for _, row in entry_usage.head(10).iterrows()  # Top 10 for brevity
        ],
        'by_vehicle_class': [
            {
                'vehicle_class': row['Vehicle Class'],
                'crz_entries': int(row['CRZ Entries']),
                'excluded_entries': int(row['Excluded Roadway Entries']),
                'total': int(row['Total']),
                'excluded_percentage': float(row['Excluded Percentage'])
            }
            for _, row in vehicle_usage.iterrows()
        ],
        'by_time': [
            {
                'hour': int(row['Hour of Day']),
                'crz_entries': int(row['CRZ Entries']),
                'excluded_entries': int(row['Excluded Roadway Entries']),
                'excluded_percentage': float(row['Excluded Percentage'])
            }
            for _, row in hourly_usage.iterrows()
        ],
        'filter_summary': {
            'date_range': f"{filtered_df['Toll Date'].min().strftime('%Y-%m-%d')} to {filtered_df['Toll Date'].max().strftime('%Y-%m-%d')}" if not filtered_df.empty else "No data",
            'day_type': day_type if day_type else "All days",
            'hour_range': f"{hour_range[0]}:00 to {hour_range[1]}:00" if hour_range else "All hours",
            'time_period': time_period if time_period else "All periods",
            'vehicle_class': vehicle_class if vehicle_class else "All vehicles",
            'entry_region': entry_region if entry_region else "All regions"
        }
    }
    
    return results

def compare_traffic_segments(df,
                           dimension='time',  # 'time', 'vehicle', 'location'
                           segment_a=None,
                           segment_b=None,
                           metric='CRZ Entries'):
    """
    Compare traffic patterns between two segments (time periods, vehicle types, or locations)
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The MTA CRZ dataset
    dimension : str
        Dimension to compare: 'time', 'vehicle', or 'location'
    segment_a : dict
        Filter parameters for first segment
    segment_b : dict
        Filter parameters for second segment
    metric : str, optional
        Metric to compare: 'CRZ Entries' or 'Excluded Roadway Entries'
        
    Returns:
    --------
    dict
        Comparison results including:
        - segment_a_stats: Statistics for first segment
        - segment_b_stats: Statistics for second segment
        - differences: Key differences between segments
        - common_patterns: Common patterns between segments
    """
    # Validate segments
    if not segment_a or not segment_b:
        raise ValueError("Both segment_a and segment_b must be provided")
    
    # Apply filters for segment A
    df_a = filter_crz_data(df, **segment_a)
    
    # Apply filters for segment B
    df_b = filter_crz_data(df, **segment_b)
    
    # Analysis varies by dimension
    if dimension == 'time':
        # For time comparison, we look at patterns across other dimensions
        
        # Vehicle class distribution
        vehicle_a = df_a.groupby('Vehicle Class')[metric].sum()
        total_a = vehicle_a.sum()
        vehicle_a_pct = (vehicle_a / total_a * 100).round(1) if total_a > 0 else vehicle_a * 0
        
        vehicle_b = df_b.groupby('Vehicle Class')[metric].sum()
        total_b = vehicle_b.sum()
        vehicle_b_pct = (vehicle_b / total_b * 100).round(1) if total_b > 0 else vehicle_b * 0
        
        # Entry point distribution
        entry_a = df_a.groupby('Detection Group')[metric].sum()
        entry_a_pct = (entry_a / total_a * 100).round(1) if total_a > 0 else entry_a * 0
        
        entry_b = df_b.groupby('Detection Group')[metric].sum()
        entry_b_pct = (entry_b / total_b * 100).round(1) if total_b > 0 else entry_b * 0
        
        # Calculate differences in percentages for vehicle classes
        vehicle_diff = {}
        for vehicle in set(vehicle_a.index) | set(vehicle_b.index):
            pct_a = vehicle_a_pct.get(vehicle, 0)
            pct_b = vehicle_b_pct.get(vehicle, 0)
            vehicle_diff[vehicle] = float(pct_b - pct_a)
        
        # Find top entry point differences
        entry_diff = {}
        for entry in set(entry_a.index) | set(entry_b.index):
            pct_a = entry_a_pct.get(entry, 0)
            pct_b = entry_b_pct.get(entry, 0)
            entry_diff[entry] = float(pct_b - pct_a)
        
        # Sort differences
        vehicle_diff = dict(sorted(vehicle_diff.items(), key=lambda x: abs(x[1]), reverse=True))
        entry_diff = dict(sorted(entry_diff.items(), key=lambda x: abs(x[1]), reverse=True))
        
        # Prepare results
        segment_a_name = f"Period A: {segment_a.get('day_type', 'All days')}"
        if 'hour_range' in segment_a and segment_a['hour_range']:
            segment_a_name += f", {segment_a['hour_range'][0]}-{segment_a['hour_range'][1]} hours"
        
        segment_b_name = f"Period B: {segment_b.get('day_type', 'All days')}"
        if 'hour_range' in segment_b and segment_b['hour_range']:
            segment_b_name += f", {segment_b['hour_range'][0]}-{segment_b['hour_range'][1]} hours"
        
        results = {
            'comparison_type': 'Time periods',
            'segment_a': {
                'name': segment_a_name,
                'total_volume': int(total_a),
                'vehicle_distribution': vehicle_a_pct.to_dict(),
                'top_entry_points': entry_a_pct.nlargest(5).to_dict()
            },
            'segment_b': {
                'name': segment_b_name,
                'total_volume': int(total_b),
                'vehicle_distribution': vehicle_b_pct.to_dict(),
                'top_entry_points': entry_b_pct.nlargest(5).to_dict()
            },
            'differences': {
                'total_volume_diff': int(total_b - total_a),
                'total_volume_pct_diff': float((total_b - total_a) / total_a * 100) if total_a > 0 else 0,
                'vehicle_distribution_diff': {k: v for k, v in list(vehicle_diff.items())[:5]},  # Top 5
                'entry_point_diff': {k: v for k, v in list(entry_diff.items())[:5]}  # Top 5
            }
        }
    
    elif dimension == 'vehicle':
        # For vehicle comparison, we look at time and location patterns
        
        # Time patterns - hour of day
        hour_a = df_a.groupby('Hour of Day')[metric].sum()
        total_a = hour_a.sum()
        hour_a_pct = (hour_a / total_a * 100).round(1) if total_a > 0 else hour_a * 0
        
        hour_b = df_b.groupby('Hour of Day')[metric].sum()
        total_b = hour_b.sum()
        hour_b_pct = (hour_b / total_b * 100).round(1) if total_b > 0 else hour_b * 0
        
        # Day of week patterns
        day_a = df_a.groupby('Day of Week')[metric].sum()
        day_a_pct = (day_a / total_a * 100).round(1) if total_a > 0 else day_a * 0
        
        day_b = df_b.groupby('Day of Week')[metric].sum()
        day_b_pct = (day_b / total_b * 100).round(1) if total_b > 0 else day_b * 0
        
        # Entry point patterns
        entry_a = df_a.groupby('Detection Group')[metric].sum()
        entry_a_pct = (entry_a / total_a * 100).round(1) if total_a > 0 else entry_a * 0
        
        entry_b = df_b.groupby('Detection Group')[metric].sum()
        entry_b_pct = (entry_b / total_b * 100).round(1) if total_b > 0 else entry_b * 0
        
        # Calculate differences
        hour_diff = {}
        for hour in range(24):
            pct_a = hour_a_pct.get(hour, 0)
            pct_b = hour_b_pct.get(hour, 0)
            hour_diff[hour] = float(pct_b - pct_a)
        
        # Find peak hours
        peak_hour_a = hour_a.idxmax() if not hour_a.empty else None
        peak_hour_b = hour_b.idxmax() if not hour_b.empty else None
        
        # Sort differences
        hour_diff = dict(sorted(hour_diff.items(), key=lambda x: abs(x[1]), reverse=True))
        
        # Prepare results
        segment_a_name = f"Vehicle A: {segment_a.get('vehicle_class', 'All vehicles')}"
        segment_b_name = f"Vehicle B: {segment_b.get('vehicle_class', 'All vehicles')}"
        
        results = {
            'comparison_type': 'Vehicle classes',
            'segment_a': {
                'name': segment_a_name,
                'total_volume': int(total_a),
                'peak_hour': int(peak_hour_a) if peak_hour_a is not None else None,
                'hourly_distribution': hour_a_pct.to_dict(),
                'day_distribution': day_a_pct.to_dict(),
                'top_entry_points': entry_a_pct.nlargest(5).to_dict()
            },
            'segment_b': {
                'name': segment_b_name,
                'total_volume': int(total_b),
                'peak_hour': int(peak_hour_b) if peak_hour_b is not None else None,
                'hourly_distribution': hour_b_pct.to_dict(),
                'day_distribution': day_b_pct.to_dict(),
                'top_entry_points': entry_b_pct.nlargest(5).to_dict()
            },
            'differences': {
                'total_volume_diff': int(total_b - total_a),
                'total_volume_pct_diff': float((total_b - total_a) / total_a * 100) if total_a > 0 else 0,
                'hour_distribution_diff': {str(k): v for k, v in list(hour_diff.items())[:5]},  # Top 5
                'peak_hour_diff': int(peak_hour_b - peak_hour_a) if peak_hour_a is not None and peak_hour_b is not None else None
            }
        }
    
    elif dimension == 'location':
        # For location comparison, we look at time and vehicle patterns
        
        # Time patterns - hour of day
        hour_a = df_a.groupby('Hour of Day')[metric].sum()
        total_a = hour_a.sum()
        hour_a_pct = (hour_a / total_a * 100).round(1) if total_a > 0 else hour_a * 0
        
        hour_b = df_b.groupby('Hour of Day')[metric].sum()
        total_b = hour_b.sum()
        hour_b_pct = (hour_b / total_b * 100).round(1) if total_b > 0 else hour_b * 0
        
        # Vehicle patterns
        vehicle_a = df_a.groupby('Vehicle Class')[metric].sum()
        vehicle_a_pct = (vehicle_a / total_a * 100).round(1) if total_a > 0 else vehicle_a * 0
        
        vehicle_b = df_b.groupby('Vehicle Class')[metric].sum()
        vehicle_b_pct = (vehicle_b / total_b * 100).round(1) if total_b > 0 else vehicle_b * 0
        
        # Calculate differences
        vehicle_diff = {}
        for vehicle in set(vehicle_a.index) | set(vehicle_b.index):
            pct_a = vehicle_a_pct.get(vehicle, 0)
            pct_b = vehicle_b_pct.get(vehicle, 0)
            vehicle_diff[vehicle] = float(pct_b - pct_a)
        
        # Find peak hours
        peak_hour_a = hour_a.idxmax() if not hour_a.empty else None
        peak_hour_b = hour_b.idxmax() if not hour_b.empty else None
        
        # Excluded roadway usage
        excluded_a = df_a['Excluded Roadway Entries'].sum()
        excluded_pct_a = (excluded_a / (total_a + excluded_a) * 100).round(1) if (total_a + excluded_a) > 0 else 0
        
        excluded_b = df_b['Excluded Roadway Entries'].sum()
        excluded_pct_b = (excluded_b / (total_b + excluded_b) * 100).round(1) if (total_b + excluded_b) > 0 else 0
        
        # Prepare results
        segment_a_name = f"Location A: {segment_a.get('entry_point', segment_a.get('entry_region', 'All locations'))}"
        segment_b_name = f"Location B: {segment_b.get('entry_point', segment_b.get('entry_region', 'All locations'))}"
        
        results = {
            'comparison_type': 'Locations',
            'segment_a': {
                'name': segment_a_name,
                'total_volume': int(total_a),
                'peak_hour': int(peak_hour_a) if peak_hour_a is not None else None,
                'hourly_distribution': hour_a_pct.to_dict(),
                'vehicle_distribution': vehicle_a_pct.to_dict(),
                'excluded_roadway_percentage': float(excluded_pct_a)
            },
            'segment_b': {
                'name': segment_b_name,
                'total_volume': int(total_b),
                'peak_hour': int(peak_hour_b) if peak_hour_b is not None else None,
                'hourly_distribution': hour_b_pct.to_dict(),
                'vehicle_distribution': vehicle_b_pct.to_dict(),
                'excluded_roadway_percentage': float(excluded_pct_b)
            },
            'differences': {
                'total_volume_diff': int(total_b - total_a),
                'total_volume_pct_diff': float((total_b - total_a) / total_a * 100) if total_a > 0 else 0,
                'vehicle_distribution_diff': {k: v for k, v in list(vehicle_diff.items())[:5]},  # Top 5
                'peak_hour_diff': int(peak_hour_b - peak_hour_a) if peak_hour_a is not None and peak_hour_b is not None else None,
                'excluded_roadway_pct_diff': float(excluded_pct_b - excluded_pct_a)
            }
        }
    
    else:
        raise ValueError(f"Unsupported comparison dimension: {dimension}")
    
    return results