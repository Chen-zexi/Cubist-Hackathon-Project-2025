# NYC Congestion Relief Zone LLM Workflow Testing

This directory contains test scripts for the NYC Congestion Relief Zone LLM workflow.

## Test Scripts

### 1. Automated Testing (`test_llm_workflow.py`)

This script contains a comprehensive test suite that validates the LLM workflow with various example queries. It includes tests for all analysis functions, focusing on both basic and complex queries.

To run all tests:
```bash
python -m src.test.test_llm_workflow
```

For running only specific tests (faster during development):
1. Edit the `run_selected_tests()` function to include the tests you want to run
2. Uncomment the `run_selected_tests()` line and comment out the `run_all_tests()` line
3. Run the script as shown above

### 2. Interactive Testing (`test_interactive.py`)

This script provides an interactive menu-driven interface for testing individual queries and exploring the system's capabilities.

To run the interactive test tool:
```bash
python -m src.test.test_interactive
```

The tool allows you to:
- Select from predefined query categories
- Run individual example queries
- Enter your own custom queries
- See execution time for each query

## Example Queries

The test scripts include example queries for all functions in the system:

1. **Basic Data Filtering**
   - "Show me traffic data for weekends in April 2025"

2. **Entry Point Analysis**
   - "What are the top 5 busiest entry points during weekday morning rush hours?"

3. **Peak Period Analysis**
   - "What are the peak traffic hours during weekdays?"

4. **Vehicle Distribution Analysis**
   - "What is the breakdown of vehicle types entering the congestion zone during peak hours?"

5. **Time Trend Analysis**
   - "How does traffic volume vary by day of the week?"

6. **Excluded Roadway Usage Analysis**
   - "What percentage of vehicles use excluded roadways instead of entering the congestion zone?"

7. **Regional Traffic Flow Analysis** (New)
   - "What regions have the highest traffic flows and how do they vary throughout the day?"
   - "Show me the traffic flow patterns in the Midtown region during weekdays, including time variations"

8. **Congestion Forecasting** (New)
   - "Forecast the traffic congestion for next Monday at 8 AM"
   - "What will the congestion level be next Friday evening at 6 PM in the Downtown region?"
   - "Predict the traffic volume for commercial vehicles (class 2) next Tuesday morning"

9. **Traffic Segment Comparison**
   - "Compare the traffic patterns between weekdays and weekends"

10. **Complex Multi-function Queries**
    - "Forecast the congestion in the Upper East Side region for next Monday and show how it compares to the typical pattern"
    - "What are the peak hours for commercial vehicles and how does their distribution compare to passenger vehicles?"

## Adding New Tests

To add new test cases:
1. For automated tests, add new test methods to the `TestLLMWorkflow` class in `test_llm_workflow.py`
2. For interactive testing, add new queries to the `EXAMPLE_QUERIES` dictionary in `test_interactive.py` 