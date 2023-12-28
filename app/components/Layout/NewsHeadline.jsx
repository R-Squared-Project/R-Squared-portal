import React from "react";
import {Alert, Icon} from "bitshares-ui-style-guide";
import {Carousel} from "antd";
import SettingsActions from "actions/SettingsActions";
import {connect} from "alt-react";
import SettingsStore from "stores/SettingsStore";
import {hash} from "@r-squared/rsquared-js";
import {getNotifications, getGateways} from "../../lib/chain/onChainConfig";

const getNewsItemHash = news => {
    return hash
        .sha1(news.type + news.begin_date + news.end_date + news.content)
        .toString("hex");
};

const filterNews = (news, hiddenNewsHeadline) => {
    return {
        ...Object.values(news).filter(item => {
            if (
                typeof item == "object" &&
                item.type &&
                item.begin_date &&
                item.end_date &&
                item.content
            ) {
                return hiddenNewsHeadline.indexOf(getNewsItemHash(item)) == -1;
            } else {
                return false;
            }
        })
    };
};
class NewsHeadline extends React.Component {
    constructor() {
        super();
        this.state = {
            news: {},
            hiddenNewsHeadlineSize: 0
        };
    }

    componentDidMount() {
        this.getNewsThroughAsset();
        //this.getNewsFromGitHub.call(this);
    }

    static getDerivedStateFromProps(props, state) {
        if (props.hiddenNewsHeadline.size !== state.hiddenNewsHeadlineSize) {
            return {
                news: filterNews(state.news, props.hiddenNewsHeadline),
                hiddenNewsHeadlineSize: props.hiddenNewsHeadline.size
            };
        }
        return null;
    }

    shouldComponentUpdate(props, state) {
        return (
            Object.keys(this.state.news).length !==
                Object.keys(state.news).length ||
            props.hiddenNewsHeadline.size !== this.props.hiddenNewsHeadline.size
        );
    }

    getNewsFromGitHub() {
        fetch(
            "https://api.github.com/repos/blockchainprojects/bitshares-ui/contents/news.json?ref=news_feed_on_the_very_top"
        )
            .then(res => {
                return res.json();
            })
            .then(
                (json => {
                    const news = filterNews(
                        JSON.parse(atob(json.content)),
                        this.props.hiddenNewsHeadline
                    );
                    this.setState({news});
                }).bind(this)
            );
    }

    async getNewsThroughAsset() {
        const notificationList = await getNotifications();
        const news = filterNews(
            notificationList,
            this.props.hiddenNewsHeadline
        );
        this.setState({news});
    }

    onClose(item) {
        let _hash = getNewsItemHash(item);
        if (
            this.props.hiddenNewsHeadline.indexOf(getNewsItemHash(item)) == -1
        ) {
            SettingsActions.hideNewsHeadline(_hash);
        }
    }

    render() {
        const {news} = this.state;
        if (!Object.keys(news).length) {
            return null;
        }
        const renderAlert = Object.values(news).reduce((acc, item, index) => {
            const now = new Date();
            const type = item.type === "critical" ? "error" : item.type; // info & warning
            const begin = new Date(item.begin_date.split(".").reverse());
            const end = new Date(item.end_date.split(".").reverse());
            let content = item.content;
            if (now >= begin && now <= end) {
                // only recognize links that start with http and are ended with an exclamation mark
                let urlTest = /(https?):\/\/(www\.)?[^!]+/g;
                let urls = content.match(urlTest);
                if (urls && urls.length) {
                    urls.forEach(url => {
                        let _split = content.split(url);
                        content = (
                            <span>
                                {_split[0]}
                                <a
                                    target="_blank"
                                    className="external-link"
                                    rel="noopener noreferrer"
                                    href={url}
                                    style={{cursor: "pointer"}}
                                >
                                    {url}
                                </a>
                                {_split[1]}
                            </span>
                        );
                    });
                }
                acc = [
                    ...acc,
                    <div className="git-info" key={`git-alert${index}`}>
                        <Alert type={type} message={content} banner />
                        {type === "info" || type === "warning" ? (
                            <Icon
                                type="close"
                                className="close-icon"
                                style={{cursor: "pointer"}}
                                onClick={this.onClose.bind(this, item)}
                            />
                        ) : null}
                    </div>
                ];
            }
            return acc;
        }, []);
        return (
            <Carousel autoplaySpeed={15000} autoplay dots={false}>
                {renderAlert}
            </Carousel>
        );
    }
}

NewsHeadline = connect(NewsHeadline, {
    listenTo() {
        return [SettingsStore];
    },
    getProps() {
        return {
            hiddenNewsHeadline: SettingsStore.getState().hiddenNewsHeadline
        };
    }
});

export default NewsHeadline;
