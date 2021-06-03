import { useState, useEffect } from 'react';
import './App.css';
import Child from './Child';


function App() {

	const [childWindow, setChildWindow] = useState(null);

	// useEffect(() => {
	// 	if (childWindow) {
	// 		const i = childWindow.document.createElement('img');
	// 		i.src = "file:///C:/Users/LAP12733-local/AppData/Local/ZaloPC/1938495284597126845/ZaloDownloads/Cache/group/2b2f774e058897e05811ff2f66e85ea7.jpg";
	// 	}
	// });

	const openChild = () => {
		setChildWindow(window.open('http://localhost:3000/child.html', 'keyframe'));
	}

	return (
		<div className="App">
			<button onClick={openChild}>Open Child</button>
			<Child childWindow={childWindow}>

			</Child>
		</div>
	);
}

export default App;
