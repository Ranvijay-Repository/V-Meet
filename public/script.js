const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
// let name = prompt('Enter Your Name', <input type="text" />);
let username = window.prompt('Enter your name: ');

var peer = new Peer(undefined, {
	path: '/peerjs',
	host: '/',
	port: '3030'
});

let myVideoStream;

navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true
	})
	.then((stream) => {
		myVideoStream = stream;
		addVideoStream(myVideo, stream, username);

		peer.on('call', (call) => {
			call.answer(stream);
			const video = document.createElement('video');
			call.on('stream', (userVideoStream) => {
				addVideoStream(video, userVideoStream, username);
			});
		});

		socket.on('user-connected', (userId) => {
			connectToNewUser(userId, stream);
		});

		// input value
		let text = $('input');
		// when press enter send message
		$('html').keydown(function(e) {
			if (e.which == 13 && text.val().length !== 0) {
				socket.emit('message', text.val());
				text.val('');
			}
		});

		socket.on('createMessage', (message) => {
			$('.messages').append(`<li class="message"><b>${username}</b><br/>${message}`);
			console.log(`"From" ${username}" :"`, message);
		});
	});

peer.on('open', (id, username) => {
	socket.emit('join-room', ROOM_ID, id, username);
	// console.log('New Join: ' + id);
});

function connectToNewUser(userId, stream, username) {
	const call = peer.call(userId, stream, username);
	const video = document.createElement('video');
	call.on('stream', (userVideoStream) => {
		addVideoStream(video, userVideoStream, username);
	});
	console.log(`${username}` + userId);
}

function addVideoStream(video, stream, username) {
	const name = username;
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
	});
	videoGrid.append(video);
}

const scrollToBottom = () => {
	var d = $('.main__chat_window');
	d.scrollTop(d.prop('scrollHeight'));
};

const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		setUnmuteButton();
	} else {
		setMuteButton();
		myVideoStream.getAudioTracks()[0].enabled = true;
	}
};

const playStop = () => {
	console.log('object');
	let enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		setPlayVideo();
	} else {
		setStopVideo();
		myVideoStream.getVideoTracks()[0].enabled = true;
	}
};

const setMuteButton = () => {
	const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
	document.querySelector('.main__mute_button').innerHTML = html;
};

const setUnmuteButton = () => {
	const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
	document.querySelector('.main__mute_button').innerHTML = html;
};

const setStopVideo = () => {
	const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
	document.querySelector('.main__video_button').innerHTML = html;
};

const setPlayVideo = () => {
	const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
	document.querySelector('.main__video_button').innerHTML = html;
};
