import { useEffect, useState } from "react";
import AccountElement from "../components/account/AccountElement";
import {
	FormInput,
	FormSubmit,
	FormError,
} from "../components/account/FormElements";
import { useNavigate } from "react-router-dom";
import { fetchRequest } from "../helper/functions";

const Register = (props) => {
	const { loginDetails, setLoginDetails } = props;
	const [registerForm, setRegisterForm] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [registerError, setRegisterError] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (loginDetails !== null) {
			navigate("/");
		}
	}, [loginDetails]);

	useEffect(() => {
		setRegisterError(false);
	}, [registerForm]);

	function validateRegister() {
		if (validateFormFields() === true) {
			attemptRegister();
		}
	}

	function validateFormFields() {
		const validEmailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		if (registerForm.username.length < 3) {
			return setRegisterError((prev) => ({
				...prev,
				username: "Username must be at least 3 characters",
			}));
		}
		if (registerForm.username.length > 20) {
			return setRegisterError((prev) => ({
				...prev,
				username: "Username must be 20 characters or less",
			}));
		}
		if (registerForm.username.includes(" ")) {
			return setRegisterError((prev) => ({
				...prev,
				username: "Username must not have space",
			}));
		}
		if (!registerForm.email.match(validEmailRegex)) {
			return setRegisterError((prev) => ({
				...prev,
				email: "Please enter a valid email address",
			}));
		}
		if (registerForm.password.length < 6) {
			return setRegisterError((prev) => ({
				...prev,
				password: "Password must be at least 6 characters",
				confirmPassword: "Password does not match",
			}));
		} else if (
			registerForm.password !== registerForm.confirmPassword ||
			registerForm.confirmPassword === ""
		) {
			return setRegisterError((prev) => ({
				...prev,
				confirmPassword: "Password does not match",
			}));
		}

		return true;
	}

	function attemptRegister() {
		const body = {
			username: registerForm.username,
			email: registerForm.email,
			password: registerForm.password,
		};

		fetchRequest(
			"http://localhost:1337/api/auth/local/register",
			"POST",
			body,
			"",
			validateUser
		);
	}

	function validateUser(user) {
		if (user.data === null) {
			setRegisterError((prev) => ({
				...prev,
				username: "Username or email are already taken",
				email: "Username or email are already taken",
			}));
		} else {
			localStorage.setItem("login", JSON.stringify(user));
			setLoginDetails(user);
			navigate("/");
		}
	}

	return (
		<AccountElement heading="Welcome! Create your account now!">
			<form action="" className="flex flex-col gap-4">
				<FormInput
					type="text"
					label="Username"
					placeholder="Enter your username"
					value={registerForm.username}
					onChange={(e) => {
						setRegisterForm((prev) => ({
							...prev,
							username: e.target.value,
						}));
					}}
				/>
				{registerError.username !== false && (
					<FormError text={registerError.username} />
				)}
				<FormInput
					type="text"
					label="Email"
					placeholder="Enter your email"
					value={registerForm.email}
					onChange={(e) => {
						setRegisterForm((prev) => ({
							...prev,
							email: e.target.value,
						}));
					}}
				/>
				{registerError.email !== false && (
					<FormError text={registerError.email} />
				)}
				<FormInput
					type="password"
					label="Password"
					placeholder="Enter your password"
					value={registerForm.password}
					onChange={(e) => {
						setRegisterForm((prev) => ({
							...prev,
							password: e.target.value,
						}));
					}}
				/>
				{registerError.password !== false && (
					<FormError text={registerError.password} />
				)}
				<FormInput
					type="password"
					label="Confirm Password"
					placeholder="Re-enter your password"
					value={registerForm.confirmPassword}
					onChange={(e) => {
						setRegisterForm((prev) => ({
							...prev,
							confirmPassword: e.target.value,
						}));
					}}
				/>
				{registerError.confirmPassword !== false && (
					<FormError text={registerError.confirmPassword} />
				)}
				<FormSubmit
					onClick={(e) => {
						e.preventDefault();
						validateRegister();
					}}
					text="Register Account"
				/>
			</form>
		</AccountElement>
	);
};

export default Register;
