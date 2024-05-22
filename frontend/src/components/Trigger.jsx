import React from "react"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"

function Trigger({ title, children }) {
	const renderTooltip = (props) => (
		<Tooltip id='button-tooltip' {...props}>
			{title}
		</Tooltip>
	)

	return (
		<OverlayTrigger
			placement='right'
			delay={{ show: 250, hide: 400 }}
			overlay={renderTooltip}
		>
			{children}
		</OverlayTrigger>
	)
}

export default Trigger
