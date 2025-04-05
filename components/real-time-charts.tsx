export default function RealTimeChartsPage() {
  return (
    <div className="w-full h-screen">
      <iframe
        src="/multi_chart.html"
        className="w-full h-full border-none"
        title="Real-time Charts"
      ></iframe>
    </div>
  );
}
