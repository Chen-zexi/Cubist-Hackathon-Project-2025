import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

def load_and_process_data(file_path):
    """
    Load and process MTA Congestion Relief Zone data with comprehensive cleaning and feature engineering
    """
    # Load data
    df = pd.read_csv(file_path)
    
    # Convert date and time columns to appropriate types
    date_columns = ['Toll Date', 'Toll Week']
    for col in date_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col])
    
    timestamp_columns = ['Toll Hour', 'Toll 10 Minute Block']
    for col in timestamp_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col])
    
    # Feature engineering - create useful derived columns
    if 'Toll Date' in df.columns:
        # Extract date components for easier filtering and aggregation
        df['Year'] = df['Toll Date'].dt.year
        df['Month'] = df['Toll Date'].dt.month
        df['Month_Name'] = df['Toll Date'].dt.strftime('%B')
        df['Week_Number'] = df['Toll Date'].dt.isocalendar().week
        df['Is_Weekend'] = df['Day of Week Int'].apply(lambda x: 1 if x in [1, 7] else 0)
        df['Is_Peak'] = df['Time Period'].apply(lambda x: 1 if x == 'Peak' else 0)
    
    # Clean data - handle missing values
    for col in df.columns:
        if df[col].dtype in ['int64', 'float64']:
            df[col] = df[col].fillna(0)
        else:
            df[col] = df[col].fillna('Unknown')
    
    
    # Daily aggregates
    daily_entries = df.groupby('Toll Date').agg({
        'CRZ Entries': 'sum',
        'Excluded Roadway Entries': 'sum'
    }).reset_index()
    
    # Hourly aggregates by day of week
    hourly_dow_entries = df.groupby(['Day of Week', 'Hour of Day']).agg({
        'CRZ Entries': 'sum',
        'Excluded Roadway Entries': 'sum'
    }).reset_index()
    
    # Vehicle class aggregates
    vehicle_class_entries = df.groupby('Vehicle Class').agg({
        'CRZ Entries': 'sum',
        'Excluded Roadway Entries': 'sum'
    }).reset_index()
    
    # Entry point aggregates
    entry_point_entries = df.groupby('Detection Group').agg({
        'CRZ Entries': 'sum',
        'Excluded Roadway Entries': 'sum'
    }).reset_index()
    
    aggregations = {
        'daily': daily_entries,
        'hourly_dow': hourly_dow_entries,
        'vehicle_class': vehicle_class_entries,
        'entry_point': entry_point_entries
    }
    
    return df, aggregations 