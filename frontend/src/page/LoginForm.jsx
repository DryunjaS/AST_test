import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigate } from "react-router-dom"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import ModuleErr from "../components/Modal/ModuleErr"
import { login } from "../http/userAPI"

const LoginForm = () => {
	const navigate = useNavigate()
	const [name, setName] = useState("")
	const [password, setPassword] = useState("")
	const [err, setErr] = useState(false)

	if (localStorage.getItem("isAuth") === "true") {
		return navigate("/preview")
	}

	const loginHandler = async (e) => {
		e.preventDefault()

		try {
			if (!name) {
				setErr("Введите логин!")
				return
			}
			if (!password) {
				setErr("Введите пароль!")
				return
			}

			await login(name.trim(), password.trim())

			navigate("/preview")
		} catch {
			setErr("Возникла ошибка при входе!")
		}
	}

	return (
		<div className='auth-wrapp '>
			<ModuleErr err={err} setErr={setErr} />
			<div className='auth-form'>
				<h2 className='title'>Вход в систему</h2>
				<Form onSubmit={loginHandler}>
					<Form.Group className='mb-3' controlId='formGroupLogin'>
						<Form.Label>Логин</Form.Label>
						<Form.Control
							type='name'
							placeholder='Введите логин'
							onChange={(e) => setName(e.target.value)}
							value={name}
							required
						/>
						<Form.Control.Feedback type='invalid'>
							Введите логин
						</Form.Control.Feedback>
					</Form.Group>
					<Form.Group className='mb-3' controlId='formGroupPassword'>
						<Form.Label>Пароль</Form.Label>
						<Form.Control
							type='password'
							placeholder='Введите пароль'
							onChange={(e) => setPassword(e.target.value)}
							value={password}
						/>
					</Form.Group>
					<div className='btn-wrap'>
						<Button type='submit' className='btn__auth'>
							Войти
						</Button>
					</div>
				</Form>
			</div>
		</div>
	)
}

export default LoginForm
