'use strict';
/*global axios, moment $ */

const duo = {

  fetchUserInfo: () => {  
    axios({
      'url':'https://cors-anywhere.herokuapp.com/https://www.duolingo.com/users/evang522',
      'headers': {
        'x-requested-with':'friendface'
      }
    })
      .then(response => {
        const potentialLanguages = response.data.languages;
        let userData;
        

        let i=0;
        while (i<potentialLanguages.length) {
          if (response.data.language_data[potentialLanguages[i].language]) {
            userData = response.data.language_data[potentialLanguages[i].language]['points_ranking_data'];
            break;
          }
          i++;
        }
      


        userData.forEach(item => {
          switch(item.username) {

          case 'evang522':
            return item.points_data.total-= 10046; 
          
          case 'JoedKend':
            return item.points_data.total-= 3384; 
          
          case 'Clessie':
            return item.points_data.total-= 2564;

          case 'RebekahStillwell':
            return item.points_data.total-= 600;
          
          case 'JodiGarret':
            return item.points_data.total-= 950;
          
          case 'sousmarins':
            return item.points_data.total-=650;

          case 'TamiGarret':
            return item.points_data.total-=210;
          
          default:
            return item.points_data.total = item.points_data.total;
          }
        });

        userData.sort((a,b) => {
          return Number(a.points_data.total) < Number(b.points_data.total);
        });

        duo.writeToDom(userData);
        $('.loader-container').css('display','none');
      });
  },

  userBlockHtml: (name, points,avatar,index) => { 
    return `
    <div class="user-block-container col-sm-5 ${index===0 ? 'leader' : ''}">
      <div class='name'>
        ${name}
        <a href='https://duolingo.com/${name}'>
        <img src='https:${avatar}/medium'>
        </a>
      </div>
      <div class='points'>
        Points this Round: <div class='points-number'>${points}</div>
      </div>
    </div>
    `; 
  },

  writeToDom: arrOfUsers => {
    let htmlString = '';
    arrOfUsers.forEach((item,index) => {
      htmlString+= duo.userBlockHtml(item.username, item.points_data.total,item.avatar,index);
    });
    $('.duo-container').html(htmlString);
  },
  writeTime: () => {
    $('.time-left').text(` Competition ends ${moment(new Date('8/20/18 17:00').getTime()).fromNow()}...`);
  }
};


// Initialize App and begin initial network request
duo.fetchUserInfo();
duo.writeTime();

// Set Interval to re-query data every 90 seconds
setInterval(duo.fetchUserInfo, 90000);


