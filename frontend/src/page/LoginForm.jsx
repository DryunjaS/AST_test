import React, { useEffect, useState } from "react"
import { login } from "../http/userAPI"
import { useNavigate } from "react-router-dom"
import Form from "react-bootstrap/Form"
import ModuleErr from "../components/Modal/ModuleErr"
import InputGroup from "react-bootstrap/InputGroup"

const LoginForm = () => {
	const navigate = useNavigate()
	const [validated, setValidated] = useState(false)
	const [err, setErr] = useState(false)

	const [authForm, setAuthForm] = useState({
		login: "",
		password: "",
	})
	const changeForm = (event) => {
		setAuthForm({
			...authForm,
			[event.target.name]: event.target.value,
		})
	}

	const loginHandler = async (event) => {
		event.preventDefault()

		try {
			const form = event.currentTarget
			if (form.checkValidity() === true) {
				await login(authForm.login.trim(), authForm.password.trim())

				if (sessionStorage.getItem("isAuth") === "true") {
					return navigate("/preview")
				}
			} else {
				setValidated(true)
			}
		} catch {
			setErr("Возникла ошибка при входе!")
		}
	}

	return (
		<div className='auth'>
			<ModuleErr err={err} setErr={setErr} />
			<div className='auth__form'>
				<h1 className='title'>Авторизация</h1>
				<Form
					noValidate
					validated={validated}
					onSubmit={loginHandler}
					className='inputWrap'
				>
					<Form.Group controlId='validationCustomUsername'>
						<InputGroup hasValidation>
							<Form.Control
								type='text'
								placeholder='Логин'
								name='login'
								value={authForm.login}
								onChange={changeForm}
								required
							/>
							<Form.Control.Feedback type='invalid' className='textCentr'>
								Введите пожалуйста логин.
							</Form.Control.Feedback>
						</InputGroup>
					</Form.Group>
					<Form.Group controlId='validationCustomPassword'>
						<InputGroup hasValidation>
							<Form.Control
								type='password'
								placeholder='Пароль'
								name='password'
								value={authForm.password}
								onChange={changeForm}
								required
							/>
							<Form.Control.Feedback type='invalid' className='textCentr'>
								Введите пожалуйста пароль.
							</Form.Control.Feedback>
						</InputGroup>
					</Form.Group>
					<button type='submit'>Войти</button>
				</Form>
			</div>
		</div>
	)
}

export default LoginForm
