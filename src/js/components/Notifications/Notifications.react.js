import React, { Component } from 'react';

import Notification from './Notification.react';


/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

export default class Notifications extends Component {

    static propTypes = {
        notifications: React.PropTypes.array
    }

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {
        // TODO (y.solovyov): should enforce reporting of this kind of long lines through eslint
        let notifications = this.props.notifications.map((notification, index) => <Notification type={ notification.type } content={ notification.content } key={ index } />);

        return (
            <div className='notifications'>
                { notifications }
            </div>
        );
    }
}
