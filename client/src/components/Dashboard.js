import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import RegisterModal from "./auth/RegisterModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

class Dashboard extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired
  };

  render() {

    const io = window.io;

    var Peer = window.SimplePeer;
    var socket = io.connect();

    var initiateBtn = document.getElementById('initiateBtn');
    var stopBtn = document.getElementById('stopBtn');
    var initiator = false;

    const stunServerConfig = {
      iceServers: [{
        url: 'turn:13.250.13.83:3478?transport=udp',
        username: "YzYNCouZM1mhqhmseWk6",
        credential: "YzYNCouZM1mhqhmseWk6"
      }]
    };

    initiateBtn.onclick = (e) => {
      initiator = true;
      socket.emit('initiate');
    }

    stopBtn.onclick = (e) => {
      socket.emit('initiate');
    }

    socket.on('initiate', () => {
      startStream();
      initiateBtn.style.display = 'none';
      stopBtn.style.display = 'block';
    })

    const startStream = () => {
      if (initiator) {
        // get screen stream
        navigator.mediaDevices.getUserMedia({
          video: {
            mediaSource: "screen",
            width: { max: '1920' },
            height: { max: '1080' },
            frameRate: { max: '10' }
          }
        }).then(gotMedia);
      } else {
        gotMedia(null);
      }
    }

    const gotMedia = (stream) => {
      if (initiator) {
        var peer = new Peer({
          initiator,
          stream,
          config: stunServerConfig
        });
      } else {
        var peer = new Peer({
          config: stunServerConfig
        });
      }

      peer.on('signal', function (data) {
        socket.emit('offer', JSON.stringify(data));
      });

      socket.on('offer', (data) => {
        peer.signal(JSON.parse(data));
      })

      peer.on('stream', function (stream) {
        // got remote video stream, now let's show it in a video tag
        var video = document.querySelector('video');
        video.srcObject = stream;
        video.play();
      })
    }
    
    const { isAuthenticated } = this.props.auth;

    const authContent = (
      <>
        <video autoplay></video>
        <br />
        <button id="initiateBtn" onClick={() => {

        }}>Start Sharing</button>
        <button id="stopBtn" style="display:none">Stop Sharing</button>
      </>
    );

    const guestContent = (
      <>
        <div className="card shadow mb-4">
          <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
            <h6 className="m-0 font-weight-bold text-primary">Sign Up</h6>
          </div>
          <div className="card-body">
            <div className="mb-4">
              Sign Up.
            </div>
            <RegisterModal />
          </div>
        </div>
      </>
    );

    return <div>{isAuthenticated ? authContent : guestContent}</div>;
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  null
)(Dashboard);
