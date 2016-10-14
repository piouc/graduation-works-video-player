import React, {Component} from 'react'

import EventEmitter from 'events'

import VideoPlayer from './VideoPlayer'
// import formatTime from './formatTime'

const emitter = new EventEmitter()

export default class App extends Component {
	constructor(){
		super()
		this.state = {
			playingVideoID: null,
			videos: [],
			playing: false
		}
	}
	componentDidMount(){
		fetch('videos.json').then(res => res.json()).then(res => {
			this.setState({videos: res})
		})
		emitter.on('SELECT_VIDEO', id => {
			this.setState({
				playingVideoID: id,
				fade: true
			})

			setTimeout(() => {
				this.setState({
					playing: true
				})
				setTimeout(() => {
					this.setState({
						fade: false
					})
				}, 300)
			}, 300)

		})
		emitter.on('CLOSE_VIDEO', () => {
			this.setState({
				fade: true
			})
			setTimeout(() => {
				this.setState({
					playingVideoID: null,
					playing: false
				})
				setTimeout(() => {
					this.setState({
						fade: false
					})
				}, 300)
			}, 300)
		})

	}
	render(){
		const {playingVideoID, videos, playing, loading, fade} = this.state
		const video = videos.find(v => v.id == playingVideoID)
		return (
			<div id="root">
				{
					playing ? 
					<div className="video-player-container">
						
						{<VideoPlayer src={video ? `videos/${video.src}` : ''} onClose={() => emitter.emit('CLOSE_VIDEO')} />}
					</div> :
					<VideoList videos={videos} className={playing ? 'hide' : ''} />
				}
				{loading ? <div className="loading"><div className="progress"></div></div> : null}
				{fade ? <div className="fade" /> : null}
			</div>
		)
	}
}

function VideoList(props){
	const {videos, className} = props
	const videoListItems = videos.map(video => <VideoListItem video={video} key={video.id}/>)
	return (
		<div className={`video-list ${className}`}>
			{videoListItems}
		</div>
	)
}

class VideoListItem extends Component {
	render(){
		const {id, title, author, duration, thumbnail, description} = this.props.video
		return (
			<div className="video-list-item" onClick={() => {
				// const rect = this.video.getBoundingClientRect()
				// const translateX = (document.documentElement.clientWidth / 2) - (rect.width / 2 + rect.left)
				// const translateY = (document.documentElement.clientHeight / 2) - (rect.height / 2 + rect.top)
				// const scale = Math.min(document.documentElement.clientWidth / rect.width, document.documentElement.clientHeight / rect.height)

				// this.video.pause()
				// this.video.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
				// this.video.style.filter = 'brightness(0)'
				// setTimeout(() => {
				// 	setTimeout(() => {
				// 		emitter.emit('SELECT_VIDEO', id)
				// 		emitter.emit('CHANGE_MODE', true)
				// 	}, 300)
				// }, 300)
				emitter.emit('SELECT_VIDEO', id)
			}}>
				<video className="thumbnail" src={`videos/${thumbnail}`} ref={el => this.video = el} loop/>
				<div className="info">
					<p className="author">{author}</p>
					<p className="title">{`「 ${title} 」`}</p>
					<p className="duration">{formatTime(duration)}</p>
				</div>
			</div>
		)
	}
}

function formatTime(secs){
	const hours = Math.floor(secs / 3600)
	const minutes = Math.floor(secs % 3600 / 60)
	const seconds = Math.floor(secs % 60)
	return `${hours > 0 ? hours + '時間 ' : ''}${minutes}分${seconds}秒`
}
