'use strict';
/*global axios, moment $ */

const duo = {

  fetchUserInfo: () => {  

    $('.loader-container').css('display','block');
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
      })
      .catch(err => {
        console.log(err);
        $('.loader-container').css('display','none');
        $('.duo-container').html(duo.errorHtml);
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
  errorHtml: '<div class=\'error-box\'> <h2> Error </h2> <h5><u> I had one job.</u> </h5> But really more likely the API isn\'t working. Sorry!  </p> <br> <button onclick="duo.fetchUserInfo()" class=\'retry-button btn btn-primary\'>Retry?</button></div>',

  writeToDom: arrOfUsers => {
    let htmlString = '';
    arrOfUsers.forEach((item,index) => {
      htmlString+= duo.userBlockHtml(item.username, item.points_data.total,item.avatar,index);
    });
    $('.duo-container').html(htmlString);
  },
  writeTime: () => {
    $('.time-left').text(` Competition ends ${moment(new Date('8/20/18 17:00').getTime()).fromNow()}!`);
  }
};


// Initialize App and begin initial network request

try {
  duo.fetchUserInfo();
  duo.writeTime();
} catch(e) {
  console.log('The following Error occured: ', e);

  // Display Error Message
  document.querySelector('.duo-container').innerHTML = duo.errorHtml;
  document.querySelector('.error-box').style.cssText='margin:auto';
  document.querySelector('.loader-container').style.cssText='display:none';
  
}

// Set Interval to re-query data every 90 seconds
setInterval(duo.fetchUserInfo, 90000);


