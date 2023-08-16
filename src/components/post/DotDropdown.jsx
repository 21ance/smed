import BoxContainer from "../common/BoxContainer";
import { copyToClipboard, fetchRequest } from "../../helper/functions";
import { Context } from "../../router/RouteManager";
import { useContext, useEffect } from "react";
import ConfirmDeleteModal from "../modal/ConfirmDeleteModal";
import EditPostModal from "../modal/EditPostModal";
import { useNavigate } from "react-router-dom";

const DotDropdown = (props) => {
	const { post, from } = props;
	const { login, modal, feed } = useContext(Context);
	const { loginDetails } = login;
	const { setModalConfig } = modal;
	const { setFeedData } = feed;
	const navigate = useNavigate();

	useEffect(() => {
		if (from === "profile")
			return setModalConfig((prev) => ({
				...prev,
				handleCancel: closeModal,
				width: "max-w-fit",
				form: {
					title: post.title,
					content: post.content,
				},
			}));

		setModalConfig((prev) => ({
			...prev,
			handleCancel: closeModal,
			width: "max-w-fit",
			form: {
				title: post.attributes.title,
				content: post.attributes.content,
			},
		}));
	}, []);

	function deletePost() {
		const token = `Bearer ${loginDetails.jwt}`;
		fetchRequest(
			`http://localhost:1337/api/posts/${post.id}`,
			"DELETE",
			"",
			token,
			refreshPage()
		);
		function refreshPage() {
			navigate(0);
		}
	}

	function updatePost() {
		setModalConfig((prev) => {
			const body = {
				data: {
					title: prev.form.title,
					content: prev.form.content,
				},
			};
			const token = `Bearer ${loginDetails.jwt}`;
			fetchRequest(
				`http://localhost:1337/api/posts/${post.id}`,
				"PUT",
				body,
				token,
				updateFeed
			);

			function updateFeed(data) {
				setFeedData((prev) => {
					const newState = prev.map((feed) => {
						if (feed.id === post.id) {
							return {
								...feed,
								attributes: {
									...feed.attributes,
									title: data.data.attributes.title,
									content: data.data.attributes.content,
								},
							};
						}
						return feed;
					});
					return newState;
				});
			}

			if (from === "profile") navigate(0);

			return { ...prev, active: false };
		});
	}

	function closeModal() {
		setModalConfig((prev) => ({ ...prev, active: false }));
	}

	let myPost;
	if (!loginDetails) {
		myPost === false;
	} else if (typeof post.attributes === "undefined") {
		myPost = post.users_permissions_user.id === loginDetails.user.id;
	} else {
		myPost =
			post.attributes.users_permissions_user.data.id ===
			loginDetails.user.id;
	}

	return (
		<BoxContainer
			width="w-[100px]"
			className="flex flex-col absolute items-start ml-[-80px] font-urbanist"
		>
			{myPost && (
				<>
					<button
						className="hover:text-blue-500"
						onClick={() =>
							setModalConfig((prev) => ({
								...prev,
								active: true,
								children: <EditPostModal post={post} />,
								handleSave: updatePost,
							}))
						}
					>
						Edit
					</button>
					<button
						className="hover:text-blue-500"
						onClick={() =>
							setModalConfig((prev) => ({
								...prev,
								active: true,
								children: (
									<ConfirmDeleteModal
										post={
											from === "profile"
												? post.title
												: post.attributes.title
										}
									/>
								),
								submitText: "Delete",
								submitColor: "bg-red-500 hover:bg-red-500/80",
								handleSave: deletePost,
							}))
						}
					>
						Delete
					</button>
				</>
			)}
			<button
				className="hover:text-blue-500"
				onClick={() =>
					copyToClipboard(`http://localhost:5173/#/posts/${post.id}`)
				}
			>
				Copy link
			</button>
		</BoxContainer>
	);
};

export default DotDropdown;