import React, { useEffect, useRef, useState } from "react"
import PieChart from "../components/Chart"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import fileDownload from "js-file-download"
import TestService from "../services/TestService"

const Result = () => {
	const [resValue, setResValue] = useState()
	const [resTest, setResTest] = useState(0)

	const navigate = useNavigate()
	const { testID } = useParams()

	const getResult = async () => {
		const res = await TestService.resultEvent(testID)
		setResValue(res.data)
	}
	useEffect(() => {
		getResult()
	}, [testID])
	useEffect(() => {
		const resultPercent =
			(5 * resValue?.correctCount) /
			(resValue?.correctCount + resValue?.incorrectCount + resValue?.nullCount)
		const roundedResultPercent = resultPercent.toFixed(2)
		if (!resultPercent) {
			setResTest(0)
		} else {
			setResTest(roundedResultPercent)
		}
	}, [resValue])
	const handleBurger = () => {
		navigate("/preview")
	}

	const burgerRef = useRef(null)

	useEffect(() => {
		const controlBurger = () => {
			const burgerMenu = burgerRef.current
			const scrollDifference = window.scrollY - burgerMenu.offsetTop
			if (Math.abs(scrollDifference) > 0) {
				const newTop = window.scrollY + 80 + "px"
				burgerMenu.style.transition = "top 0.4s ease-out"
				burgerMenu.style.top = newTop
			}
		}

		window.addEventListener("scroll", controlBurger)

		return () => {
			window.removeEventListener("scroll", controlBurger)
		}
	}, [])

	const handleDownload = (url, filename) => {
		axios
			.get(url, {
				responseType: "blob",
				headers: {
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
					"ngrok-skip-browser-warning": "true",
				},
			})
			.then((res) => {
				fileDownload(res.data, filename)
			})
	}
	return (
		<div className='setting-container'>
			<div className='articles'>
				<div className='burger-menu' onClick={handleBurger} ref={burgerRef}>
					&#x2715;
				</div>

				<div className='articles__item res-itog'>
					<div className='fs40'>
						Общая оценка: <div className='res-test'>{resTest}</div>
					</div>
					<div className='chart'>
						<PieChart
							countTrue={resValue?.correctCount}
							countFalse={resValue?.incorrectCount + resValue?.nullCount}
						/>
					</div>
				</div>
			</div>
			{resValue?.allAnswers.length !== 0 && (
				<div className='articles'>
					<div className='articles__item max-con'>
						<h2 className='title tc'>Вопросы теста:</h2>
					</div>
				</div>
			)}

			{resValue?.allAnswers.map((question, index) => (
				<div className='articles'>
					<div className='articles__item'>
						<h3 className='title'>
							{index + 1}. {question.ques.title}
						</h3>
						<div className='text'>
							{(() => {
								switch (question.ques.type) {
									case "radio":
										return (
											<>
												<ul>
													{question.ques.body.map((item, indexItem) => (
														<li>
															{indexItem + 1}) {item.ques}
														</li>
													))}
												</ul>
												{question.typeAns === "correct" ? (
													<div>
														Вы ответили верно:{" "}
														{question.ques.body.map((item) => (
															<span>
																{item.user_res.length !== 0 && item.ques}
															</span>
														))}
													</div>
												) : (
													<>
														<div>
															Вы ответили:{" "}
															{question.ques.body.map((item) => (
																<span>
																	{item.user_res.length !== 0 && item.ques}
																</span>
															))}
														</div>

														<div>
															Правильный ответ:{" "}
															{question.res.map((item) => (
																<span>
																	{item.res.length !== 0 && item.ques}
																</span>
															))}
														</div>
													</>
												)}
											</>
										)
									case "select":
										return (
											<>
												<ul>
													{question.ques.body.map((item, indexItem) => (
														<li>
															{indexItem + 1}) {item.ques}
														</li>
													))}
												</ul>
												{question.typeAns === "correct" ? (
													<div>
														Вы ответили верно:
														<ul>
															{question.ques.body.map((item) => (
																<li>
																	{item.ques} - {item.user_res}
																</li>
															))}
														</ul>
													</div>
												) : (
													<>
														<div>
															Вы ответили:{" "}
															<ul>
																{question.ques.body.map((item) => (
																	<li>
																		{item.ques} - {item.user_res}
																	</li>
																))}
															</ul>
														</div>

														<div>
															Правильный ответ:{" "}
															<ul>
																{question.res.map((item) => (
																	<li>
																		{item.ques} - {item.res}
																	</li>
																))}
															</ul>
														</div>
													</>
												)}
											</>
										)

									case "check":
										return (
											<>
												<ul>
													{question.ques.body.map((item, indexItem) => (
														<li>
															{indexItem + 1}){item.ques}
														</li>
													))}
												</ul>
												{question.typeAns === "correct" ? (
													<div>
														Вы ответили верно:{" "}
														<ul>
															{question.ques.body.map((item, index) => (
																<>
																	{item.user_res.length !== 0 && (
																		<li>
																			{index + 1}) {item.ques}
																		</li>
																	)}
																</>
															))}
														</ul>
													</div>
												) : (
													<>
														<div>
															Вы ответили:{" "}
															<ul>
																{question.ques.body.map((item, index) => (
																	<>
																		{item.user_res.length !== 0 && (
																			<li>
																				{index + 1}) {item.ques}
																			</li>
																		)}
																	</>
																))}
															</ul>
														</div>

														<div>
															Правильный ответ:{" "}
															<ul>
																{question.res.map(
																	(item, index) =>
																		item.res.length !== 0 && (
																			<li key={index}>
																				{index + 1}) {item.ques}
																			</li>
																		)
																)}
															</ul>
														</div>
													</>
												)}
											</>
										)
									default:
										return null
								}
							})()}
						</div>
					</div>
				</div>
			))}

			<div className='articles'>
				<button
					className='articles__item max-con result-btn'
					onClick={() =>
						handleDownload(
							`${
								import.meta.env.VITE_REACT_APP_API_URL
							}api/tests/download-result/${testID}`,
							"test.txt"
						)
					}
				>
					<div className='title tc '>Выгрузить отчет</div>
				</button>
			</div>
		</div>
	)
}
export default Result
