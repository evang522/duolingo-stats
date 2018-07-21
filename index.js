'use strict';
/*global axios, $ */

const duo = {

  fetchUserInfo: () => {  
    axios({
      'url':'https://cors-anywhere.herokuapp.com/https://www.duolingo.com/users/evang522',
      'headers': {
        'x-requested-with':'friendface'
      }
    })
      .then(response => {
        const userData = response.data.language_data.de.points_ranking_data;

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
  }
};


duo.fetchUserInfo();


