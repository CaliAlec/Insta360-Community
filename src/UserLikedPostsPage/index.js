import React from 'react';

import {
	setFollowed,
	setFollowsMap,
	setLikesMap,
	extractAccountsFromPosts
} from '../HomePage/homeActions';

import { connect } from 'react-redux';

import { Spin, List, PageHeader } from 'antd';

import InfiniteScroll from 'react-infinite-scroller';

import Header from '../Header/index.js';
import FeedCard from '../FeedCard/index.js';

import Api from '../utils/Api';

class UserLikedPostsPage extends React.Component {
	state = {
		user: {},
		posts: [],
		isFirstLoad: true,
		loading: true,
		hasMore: true,
		currentPage: 1,
		totalPages: 1,
		totalCount: null
	};

	componentDidMount() {
		this.loadUserData();
	}

	loadUserData() {
		this.setState({ loading: true });
		this.getUser();
		this.getLikedPosts();
	}

	getUser = async () => {
		const {
			match: { params },
			setFollowed
		} = this.props;
		const { userId } = params;

		const response = await Api.getUser(userId);

		const { data: user } = response;
		const { account } = user;
		const { followed } = account;

		setFollowed(userId, followed);

		this.setState({ loading: false, user });
	};

	getLikedPosts = async () => {
		const { posts, currentPage } = this.state;

		const {
			match: { params },
			setFollowsMap,
			setLikesMap
		} = this.props;
		const { userId } = params;

		const response = await Api.getLikedPosts(userId, currentPage);

		const { data } = response;
		const { list, total_page: totalPages, total_count: totalCount } = data;

		setFollowsMap(extractAccountsFromPosts(list));
		setLikesMap({ shares: list });

		this.setState({
			loading: false,
			isFirstLoad: false,
			posts: posts.concat(list),
			totalPages,
			totalCount
		});
	};

	onLoadMore = () => {
		let { currentPage, totalPages } = this.state;

		if (currentPage < totalPages) {
			currentPage = currentPage + 1;

			this.setState(
				prevState => ({
					loading: true,
					hasMore: currentPage < totalPages,
					currentPage: prevState.currentPage + 1
				}),
				() => {
					this.getLikedPosts();
				}
			);
		}
	};

	onBack = () => {
		const { user } = this.state;
		const { history } = this.props;
		const { account } = user;
		const { id: userId } = account;
		history.push(`/user/${userId}`);
	};

	isUserLoaded = () => {
		const { user } = this.state;
		return Object.keys(user).length !== 0;
	};

	renderPageHeader = () => {
		if (this.isUserLoaded()) {
			const { user } = this.state;
			const { account } = user;
			const { avatar, nickname } = account;

			return (
				<PageHeader
					style={{
						border: '1px solid rgb(235, 237, 240)'
					}}
					onBack={this.onBack}
					title={`${nickname}'s liked posts`}
					avatar={{ src: avatar }}
				/>
			);
		}
		return null;
	};

	render() {
		const { isFirstLoad, loading, hasMore, posts } = this.state;

		return (
			<div>
				<Header />

				<div className="App-container">
					<div className="App-content">
						{this.renderPageHeader()}

						<InfiniteScroll
							initialLoad={false}
							pageStart={0}
							loadMore={this.onLoadMore}
							hasMore={!loading && hasMore}
							useWindow={true}
						>
							<List
								dataSource={posts}
								loading={loading}
								renderItem={item => <FeedCard key={item.id} post={item} />}
							>
								{loading && !isFirstLoad && hasMore && (
									<div className="loading-container">
										<Spin />
									</div>
								)}
							</List>
						</InfiniteScroll>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(
	null,
	{ setFollowed, setFollowsMap, setLikesMap, extractAccountsFromPosts }
)(UserLikedPostsPage);