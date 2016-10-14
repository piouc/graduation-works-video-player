import React, {Component} from 'react'

import formatTime from './formatTime'

export default class VideoPlayer extends Component {
	constructor() {
		super()

		Object.getOwnPropertyNames(VideoPlayer.prototype).forEach(key => this[key] = VideoPlayer.prototype[key].bind(this))

		this.state = {
			paused: true,
			buffered: [],
			currentTime: 0,
			muted: false,
			duration: 0,
			currentTime: 0,
			muted: false,
			volumeChanging: false,
			hideControls: false,
			disableAutoHide: false,
			firstPlay: false,
			ended: false
		}
	}
	componentDidMount() {
		this.updateVolume()
		window.addEventListener('mousemove', this.showControls)
		window.addEventListener('click', this.showControls)
		this.showControls()
		setTimeout(() => {
			if(!this.state.firstPlay) this.play()
		}, 400)
	}
	componentWillUnmount() {
		window.removeEventListener('mousemove', this.showControls)
		window.removeEventListener('click', this.showControls)
		if(this.controlsTimeoutID) clearTimeout(this.controlsTimeoutID)
	}
	render() {
		const {src, autoPlay, onClose} = this.props
		const {paused, buffered, progress, duration, currentTime, volume, muted, ended, volumeChanging, hideControls, disableAutoHide} = this.state
		return (
			<div className={`video-player${hideControls && !paused && !disableAutoHide ? ' hide' : ''}`} ref={el => this.videoPlayer = el}>
				<video
					id="video"
					className="video"
					src={src ? src : ""}
					ref={video => this.video = video}
					onPlay={this.updatePlayingStatus}
					onPause={this.updatePlayingStatus}
					onEnded={() => {
						this.updatePlayingStatus()
						onClose()
					}}
					onTimeUpdate={this.updateCurrentTime}
					onSeeking={this.updateCurrentTime}
					onSeeked={this.updateCurrentTime}
					onDurationChange={e => this.setState({duration: this.video.duration})}
					onVolumeChange={this.updateVolume}
					onClick={() => paused ? this.play() : this.pause()}
				/>
				<div className={`controller${hideControls && !paused && !disableAutoHide ? ' hide' : ''}`}>
					<div className="seek-bar" onMouseDown={this.handleSeek} ref={el => this.progressBar = el}>
						<div className="seek-bar-handle" style={{
							width: `${currentTime / duration * 100}%`
						}}></div>
					</div>
					<button className="play-button button" onClick={() => paused ? this.play() : this.pause()}><svg><path d={paused ? 'M 9,8 23,16 9,24 z' : 'M 9,8 14,8 14,24 9,24 z M 18,8 23,8 23,24 18,24 z'} /></svg></button>
					<div className={`volume${volumeChanging ? ' changing' : ''}`}>
						<div className="volume-slider" onMouseDown={this.handleChangeVolume} ref={el => this.volumeSlider = el}>
							<div className="volume-slider-handle" style={{
								width: `${volume * 100}%`
							}}></div>
						</div>
					</div>
					<div className="time">{formatTime(currentTime)}<span className="divider">/</span>{formatTime(duration)}</div>
					<div className="spacer"></div>
					<button className="close-button" onClick={() => {if(onClose) onClose()}}><svg viewBox="0 0 32 32"><path d="M 8,8 24, 24 M 8,24 24,8" /></svg></button>
				</div>
			</div>
		)
	}
	play() {
		this.video.play()
		if(!this.state.firstPlay) {
			this.setState({firstPlay: true})
		}
	}
	pause() {
		this.video.pause()
	}
	mute() {
		const video = this.video
		video.muted = !video.muted
	}
	seek(progress) {
		this.video.currentTime = video.duration * progress
	}
	changeVolume(volume) {
		this.video.volume = volume
	}
	hideControls() {
		if(this.state.hideControls) return
		this.setState({
			hideControls: true
		})
	}
	showControls() {
		if(this.controlsTimeoutID) clearTimeout(this.controlsTimeoutID)
		this.controlsTimeoutID = setTimeout(this.hideControls, 1500)

		if(this.state.hideControls) {
			this.setState({
				hideControls: false
			})
		}
	}
	handleSeek(e) {
		const paused = this.state.paused
		this.pause()
		const mouseMoveHandler = e => {
			e.preventDefault()
			const {width, left} = this.progressBar.getBoundingClientRect()
			this.seek(Math.max(Math.min((e.clientX - left) / width, 1), 0))
		}
		this.setState({
			disableAutoHide: true
		})
		mouseMoveHandler(e)
		document.addEventListener('mousemove', mouseMoveHandler)
		document.addEventListener('mouseup', () => {
			document.removeEventListener('mousemove', mouseMoveHandler)
			this.setState({
				disableAutoHide: false
			})
			if(!paused) this.play()
		})
	}
	handleChangeVolume(e) {
		const mouseMoveHandler = e => {
			e.preventDefault()
			const {width, left} = this.volumeSlider.getBoundingClientRect()
			this.changeVolume(Math.max(Math.min((e.clientX - left) / width, 1), 0) || 0)
		}
		this.setState({
			disableAutoHide: true
		})
		mouseMoveHandler(e)
		document.addEventListener('mousemove', mouseMoveHandler)
		document.addEventListener('mouseup', () => {
			document.removeEventListener('mousemove', mouseMoveHandler)
			this.setState({
				disableAutoHide: false
			})
		})
	}
	toggleFullscreen(){
		if(document.mozFullScreen){
			document.mozCancelFullScreen()
		} else {
			this.videoPlayer.mozRequestFullScreen()
		}
	}
	updatePlayingStatus() {
		this.setState({
			paused: this.video.paused,
			ended: this.video.ended
		})
	}
	updateCurrentTime() {
		const {currentTime, duration} = this.video
		this.setState({
			currentTime: currentTime
		})
	}
	updateVolume() {
		const {volume, muted} = this.video
		this.setState({
			volume: volume,
			muted: muted
		})
	}
}

class CircleProgress extends Component {
	componentDidMount(){
		setTimeout(() => {
			const context = this.canvas.getContext('2d')
			const start = Date.now()
			const duration = this.props.duration
			context.strokeStyle = '#fff'
			context.lineWidth = 8
			context.lineCap = 'round'
			const render = () => {
				const now = Date.now()
				const progress = Math.min((now - start) / duration, 1)
				context.clearRect(0, 0, 256, 256)
				context.beginPath()
				context.arc(128, 128, 124, Math.PI * -0.5, (Math.PI * 2 * progress) - Math.PI / 2)
				context.stroke()
				if(progress < 1){
					this.requestID = window.requestAnimationFrame(render)
				} else {
					if(this.props.onEnd) this.props.onEnd()
				}
			}
			render()
		}, 400)
	}
	componentWillUnmount(){
		window.cancelAnimationFrame(this.requestID)
	}
	render(){
		return (
			<canvas width="256" height="256" ref={el => this.canvas = el} />
		)
	}
}



function bufferedToArray(buffered, duration) {
	return Array.from(Array(buffered.length)).map((v, i) => {
		return {start: buffered.start(i) / duration, end: buffered.end(i) / duration}
	})
}