import ReactDOM from 'react-dom';
import {useState} from 'react';

function Child({ childWindow }) {

    const [target, settarget] = useState(null);

    if (!childWindow) return null;
    
    childWindow.addEventListener('DOMContentLoaded', () => {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        settarget(childWindow.document.getElementById('child'));
    })
    
    console.log('target',  childWindow.document);
    if (!target) return null;
    return ReactDOM.createPortal(
        <div>
            <img src="file:///C:/Users/LAP12733-local/AppData/Local/ZaloPC/1938495284597126845/ZaloDownloads/Cache/group/2b2f774e058897e05811ff2f66e85ea7.jpg" />
        </div>,
        target
    );
}

export default Child;
