import unittest
import sys
import os
import json
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from workflow.workflow import run_workflow

class TestLLMWorkflow(unittest.TestCase):
    """Test the LLM workflow with various example queries"""
    
    def setUp(self):
        # Record test start time
        self.start_time = datetime.now()
        print(f"\nRunning test: {self._testMethodName}")
    
    def tearDown(self):
        # Calculate and display test duration
        duration = datetime.now() - self.start_time
        print(f"Test completed in {duration.total_seconds():.2f} seconds")
    
    def test_basic_filter(self):
        """Test basic filtering functionality"""
        query = "Show me traffic data for weekends in April 2025"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_entry_point_volume(self):
        """Test analyzing entry point volumes"""
        query = "What are the top 5 busiest entry points during weekday morning rush hours?"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_peak_periods(self):
        """Test identification of peak periods"""
        query = "What are the peak traffic hours during weekdays?"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_vehicle_distribution(self):
        """Test analysis of vehicle distribution"""
        query = "What is the breakdown of vehicle types entering the congestion zone during peak hours?"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_time_trends(self):
        """Test analysis of time trends"""
        query = "How does traffic volume vary by day of the week?"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_excluded_roadway_usage(self):
        """Test analysis of excluded roadway usage"""
        query = "What percentage of vehicles use excluded roadways instead of entering the congestion zone?"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_regional_traffic_flow(self):
        """Test analysis of regional traffic flow (new function)"""
        query = "What regions have the highest traffic flows and how do they vary throughout the day?"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_regional_traffic_flow_specific(self):
        """Test analysis of regional traffic flow with specific parameters"""
        query = "Show me the traffic flow patterns in the Midtown region during weekdays, including time variations"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_forecast_congestion(self):
        """Test congestion forecasting (new function)"""
        query = "Forecast the traffic congestion for next Monday at 8 AM"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_forecast_congestion_specific(self):
        """Test congestion forecasting with specific parameters"""
        query = "What will the congestion level be next Friday evening at 6 PM in the Downtown region?"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_forecast_congestion_with_vehicle(self):
        """Test congestion forecasting with vehicle type"""
        query = "Predict the traffic volume for commercial vehicles (class 2) next Tuesday morning"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_compare_segments(self):
        """Test comparison of traffic segments"""
        query = "Compare the traffic patterns between weekdays and weekends"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_complex_query_forecast_regional(self):
        """Test complex query combining forecast and regional analysis"""
        query = "Forecast the congestion in the Upper East Side region for next Monday and show how it compares to the typical pattern in that region"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)
    
    def test_complex_query_peak_vehicle(self):
        """Test complex query combining peak periods and vehicle analysis"""
        query = "What are the peak hours for commercial vehicles and how does their distribution compare to passenger vehicles?"
        result = run_workflow(query)
        print(f"Result: {result}")
        self.assertIsNotNone(result)

def run_selected_tests():
    """Run a specific subset of tests for faster iteration during development"""
    test_suite = unittest.TestSuite()
    
    # Add specific tests here
    test_suite.addTest(TestLLMWorkflow('test_regional_traffic_flow'))
    test_suite.addTest(TestLLMWorkflow('test_forecast_congestion'))
    
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(test_suite)

def run_all_tests():
    """Run all tests"""
    unittest.main()

if __name__ == "__main__":
    # Choose one of these options:
    # run_selected_tests()  # Run only selected tests (faster for development)
    run_all_tests()  # Run all tests 