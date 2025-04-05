import sys
import os
import json
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from workflow.workflow import run_workflow

# Sample queries for each function type
EXAMPLE_QUERIES = {
    "filter_data": [
        "Show me traffic data for weekends in April 2025",
        "What was the traffic like on Monday mornings between 7-9 AM?",
        "Give me traffic data for TLC vehicles during peak hours"
    ],
    "entry_points": [
        "What are the top 5 busiest entry points during weekday morning rush hours?",
        "Which entry points have the highest volume on weekends?",
        "Show me the busiest entry points for commercial vehicles"
    ],
    "peak_periods": [
        "What are the peak traffic hours during weekdays?",
        "When is the congestion zone busiest on weekends?",
        "What day of the week has the highest traffic volume?"
    ],
    "vehicle_distribution": [
        "What is the breakdown of vehicle types entering the congestion zone during peak hours?",
        "How does the vehicle mix differ between weekdays and weekends?",
        "What percentage of entries are TLC vehicles?"
    ],
    "time_trends": [
        "How does traffic volume vary by day of the week?",
        "Show me the trend of traffic volume over the last 30 days",
        "Has there been a change in commercial vehicle traffic patterns over time?"
    ],
    "excluded_roadway": [
        "What percentage of vehicles use excluded roadways instead of entering the congestion zone?",
        "Which entry points have the highest usage of excluded roadways?",
        "How does excluded roadway usage vary by time of day?"
    ],
    "regional_traffic_flow": [
        "What regions have the highest traffic flows and how do they vary throughout the day?",
        "Show me the traffic flow patterns in the Midtown region during weekdays",
        "Compare the traffic flows between Upper East Side and Downtown regions"
    ],
    "forecast_congestion": [
        "Forecast the traffic congestion for next Monday at 8 AM",
        "What will the congestion level be next Friday evening at 6 PM in the Downtown region?",
        "Predict the traffic volume for commercial vehicles next Tuesday morning"
    ],
    "compare_segments": [
        "Compare the traffic patterns between weekdays and weekends",
        "How does morning rush hour traffic compare to evening rush hour?",
        "Compare traffic patterns between commercial vehicles and passenger vehicles"
    ],
    "complex_queries": [
        "Forecast the congestion in the Upper East Side region for next Monday and show how it compares to the typical pattern",
        "What are the peak hours for commercial vehicles and how does their distribution compare to passenger vehicles?",
        "Which entry points show the biggest difference between weekday and weekend traffic, and forecast the trend for next month"
    ]
}

def display_menu():
    """Display the main menu of query categories"""
    print("\n===== NYC CONGESTION RELIEF ZONE QUERY TESTER =====")
    print("Select a category of queries to test:")
    
    categories = list(EXAMPLE_QUERIES.keys())
    for i, category in enumerate(categories):
        print(f"{i+1}. {category.replace('_', ' ').title()}")
    
    print("\nOr select from these options:")
    print("C. Custom query")
    print("Q. Quit")
    
    return categories

def run_category_queries(category):
    """Run all queries in a specific category"""
    queries = EXAMPLE_QUERIES[category]
    
    for i, query in enumerate(queries):
        print(f"\n----- Query {i+1}/{len(queries)} -----")
        print(f"Query: \"{query}\"")
        
        start_time = datetime.now()
        result = run_workflow(query)
        duration = datetime.now() - start_time
        
        print(f"\nResult: {result}")
        print(f"Query completed in {duration.total_seconds():.2f} seconds")
        
        if i < len(queries) - 1:
            input("\nPress Enter to continue to the next query...")

def select_individual_query(category):
    """Allow selection of an individual query from a category"""
    queries = EXAMPLE_QUERIES[category]
    
    print(f"\n===== {category.replace('_', ' ').title()} Queries =====")
    for i, query in enumerate(queries):
        print(f"{i+1}. \"{query}\"")
    
    while True:
        choice = input("\nSelect a query (1-{}) or 'b' to go back: ".format(len(queries)))
        
        if choice.lower() == 'b':
            return None
        
        try:
            index = int(choice) - 1
            if 0 <= index < len(queries):
                return queries[index]
            else:
                print("Invalid selection. Please try again.")
        except ValueError:
            print("Please enter a number or 'b'.")

def run_custom_query():
    """Run a custom user-provided query"""
    print("\n===== Custom Query =====")
    query = input("Enter your query about the NYC Congestion Relief Zone: ")
    
    if not query.strip():
        print("Empty query. Returning to menu.")
        return
    
    start_time = datetime.now()
    result = run_workflow(query)
    duration = datetime.now() - start_time
    
    print(f"\nResult: {result}")
    print(f"Query completed in {duration.total_seconds():.2f} seconds")
    
    input("\nPress Enter to continue...")

def main():
    """Main interactive loop"""
    while True:
        categories = display_menu()
        choice = input("\nEnter your choice: ")
        
        if choice.lower() == 'q':
            print("Exiting. Goodbye!")
            break
        elif choice.lower() == 'c':
            run_custom_query()
        else:
            try:
                index = int(choice) - 1
                if 0 <= index < len(categories):
                    category = categories[index]
                    query = select_individual_query(category)
                    
                    if query:
                        print(f"\nRunning query: \"{query}\"")
                        start_time = datetime.now()
                        result = run_workflow(query)
                        duration = datetime.now() - start_time
                        
                        print(f"\nResult: {result}")
                        print(f"Query completed in {duration.total_seconds():.2f} seconds")
                        
                        input("\nPress Enter to continue...")
                else:
                    print("Invalid selection. Please try again.")
            except ValueError:
                print("Please enter a number, 'c', or 'q'.")

if __name__ == "__main__":
    main() 