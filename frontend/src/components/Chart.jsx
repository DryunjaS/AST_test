import React from "react"
import { Pie } from "react-chartjs-2"
import { Chart, ArcElement, Tooltip, Legend } from "chart.js"

Chart.register(ArcElement, Tooltip, Legend)

const PieChart = ({ countTrue, countFalse }) => {
	const pieChartData = {
		labels: ["Правильных", "Неправильных"],
		datasets: [
			{
				data: [countTrue, countFalse],
				label: "Значение",
				backgroundColor: ["rgba(0 255 0 / 75%)", "rgba(240 50 50 / 75%)"],
				hoverBackgroundColor: ["rgb(50, 205, 50,1)", "rgb(220, 20, 60,1)"],
				borderWidth: 1,
			},
		],
	}
	const pieChart = <Pie type='pie' className='chart' data={pieChartData} />
	return pieChart
}
export default PieChart
