import React from 'react';

import { connect } from 'react-redux';

import { getFeaturedPosts } from '../../HomePage/homeActions.js';
import { Spin } from 'antd';

import FeedCard from '../../FeedCard/index.js';

import { FEED_CARD_PARENTS } from '../../utils/Constants.js';

class FeaturedFeed extends React.Component {
	state = {
		loading: true
	};

	componentDidMount() {
		const { getFeaturedPosts } = this.props;
		getFeaturedPosts();
	}

	componentDidUpdate(prevProps) {
		const { featuredPosts } = this.props;
		if (prevProps.featuredPosts !== featuredPosts) {
			this.setState({ loading: false });
		}
	}

	render() {
		const { featuredPosts } = this.props;
		const { loading } = this.state;

		return (
			<div>
				<Spin spinning={loading}>
					{featuredPosts.map(post => (
						<FeedCard
							key={post.id}
							post={post}
							parent={FEED_CARD_PARENTS.FEATURED}
						/>
					))}
				</Spin>
			</div>
		);
	}
}

function mapStateToProps(state) {
	const { homeReducer } = state;
	const { featuredPosts } = homeReducer;
	return {
		featuredPosts
	};
}

export default connect(
	mapStateToProps,
	{ getFeaturedPosts }
)(FeaturedFeed);