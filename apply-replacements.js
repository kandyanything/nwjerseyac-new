const fs = require('fs');
const replacements = [
  {
    "file": "websites.html",
    "school": "Academy of Saint Elizabeth",
    "old": "<tr>\r\n                            <td>Academy of Saint Elizabeth</td>\r\n                            <td><a href=\"http://www.academyofsaintelizabeth.org/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Academy of Saint Elizabeth</td>\r\n                            <td><a href=\"http://www.academyofsaintelizabeth.org/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Boonton High School",
    "old": "<tr>\r\n                            <td>Boonton High School</td>\r\n                            <td><a href=\"http://www.boontonschools.org/highschool/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Boonton High School</td>\r\n                            <td><a href=\"http://www.boontonschools.org/highschool/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Chatham High School",
    "old": "<tr>\r\n                            <td>Chatham High School</td>\r\n                            <td><a href=\"http://www.chatham-nj.org/chs/site/default.asp\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Chatham High School</td>\r\n                            <td><a href=\"http://www.chatham-nj.org/chs/site/default.asp\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Delbarton School",
    "old": "<tr>\r\n                            <td>Delbarton School</td>\r\n                            <td><a href=\"http://www.delbarton.org/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Delbarton School</td>\r\n                            <td><a href=\"http://www.delbarton.org/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Dover High School",
    "old": "<tr>\r\n                            <td>Dover High School</td>\r\n                            <td><a href=\"http://dhs.dover-nj.org/home\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Dover High School</td>\r\n                            <td><a href=\"http://dhs.dover-nj.org/home\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Hackettstown High School",
    "old": "<tr>\r\n                            <td>Hackettstown High School</td>\r\n                            <td><a href=\"http://www.hackettstown.org/hhs/site/default.asp\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Hackettstown High School</td>\r\n                            <td><a href=\"http://www.hackettstown.org/hhs/site/default.asp\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Hanover Park High School",
    "old": "<tr>\r\n                            <td>Hanover Park High School</td>\r\n                            <td><a href=\"http://www.hanoverpark.org\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Hanover Park High School</td>\r\n                            <td><a href=\"http://www.hanoverpark.org\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "High Point High School",
    "old": "<tr>\r\n                            <td>High Point High School</td>\r\n                            <td><a href=\"http://www.hpregional.org/hpindexv4res1000.htm\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>High Point High School</td>\r\n                            <td><a href=\"http://www.hpregional.org/hpindexv4res1000.htm\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Hopatcong High School",
    "old": "<tr>\r\n                            <td>Hopatcong High School</td>\r\n                            <td><a href=\"http://www.hopatcongschools.org/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Hopatcong High School</td>\r\n                            <td><a href=\"http://www.hopatcongschools.org/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Jefferson Township High School",
    "old": "<tr>\r\n                            <td>Jefferson Township High School</td>\r\n                            <td><a href=\"http://www.jefftwp.org/highschool/highschool.shtml\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Jefferson Township High School</td>\r\n                            <td><a href=\"http://www.jefftwp.org/highschool/highschool.shtml\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Kinnelon High School",
    "old": "<tr>\r\n                            <td>Kinnelon High School</td>\r\n                            <td><a href=\"http://www.kinnelonpublicschools.org/khs\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Kinnelon High School</td>\r\n                            <td><a href=\"http://www.kinnelonpublicschools.org/khs\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Kittatinny High School",
    "old": "<tr>\r\n                            <td>Kittatinny High School</td>\r\n                            <td><a href=\"http://www.krhs.net/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Kittatinny High School</td>\r\n                            <td><a href=\"http://www.krhs.net/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Lenape Valley High School",
    "old": "<tr>\r\n                            <td>Lenape Valley High School</td>\r\n                            <td><a href=\"http://www.lvhs.org/index.html\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Lenape Valley High School</td>\r\n                            <td><a href=\"http://www.lvhs.org/index.html\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Montville High School",
    "old": "<tr>\r\n                            <td>Montville High School</td>\r\n                            <td><a href=\"http://www.montville.net/Domain/472\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Montville High School</td>\r\n                            <td><a href=\"http://www.montville.net/Domain/472\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Morristown Beard School",
    "old": "<tr>\r\n                            <td>Morristown Beard School</td>\r\n                            <td><a href=\"http://www.mbs.net\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Morristown Beard School</td>\r\n                            <td><a href=\"http://www.mbs.net\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Morristown High School",
    "old": "<tr>\r\n                            <td>Morristown High School</td>\r\n                            <td><a href=\"http://www.morristownhighschool.org/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Morristown High School</td>\r\n                            <td><a href=\"http://www.morristownhighschool.org/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Mount Olive High School",
    "old": "<tr>\r\n                            <td>Mount Olive High School</td>\r\n                            <td><a href=\"http://www.mtoliveboe.org/moths/site/default.asp\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Mount Olive High School</td>\r\n                            <td><a href=\"http://www.mtoliveboe.org/moths/site/default.asp\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Mountain Lakes High School",
    "old": "<tr>\r\n                            <td>Mountain Lakes High School</td>\r\n                            <td><a href=\"http://www.mtlakes.org/hs/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Mountain Lakes High School</td>\r\n                            <td><a href=\"http://www.mtlakes.org/hs/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Newton High School",
    "old": "<tr>\r\n                            <td>Newton High School</td>\r\n                            <td><a href=\"http://newton.nj.schoolwebpages.com/education/school/school.php?sectionid=4\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Newton High School</td>\r\n                            <td><a href=\"http://newton.nj.schoolwebpages.com/education/school/school.php?sectionid=4\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "North Warren",
    "old": "<tr>\r\n                            <td>North Warren</td>\r\n                            <td><a href=\"http://www.northwarren.org\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>North Warren</td>\r\n                            <td><a href=\"http://www.northwarren.org\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Parsippany High School",
    "old": "<tr>\r\n                            <td>Parsippany High School</td>\r\n                            <td><a href=\"http://www.pthsd.k12.nj.us/SCH/PHS/PHS.title.html\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Parsippany High School</td>\r\n                            <td><a href=\"http://www.pthsd.k12.nj.us/SCH/PHS/PHS.title.html\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Parsippany Hills High School",
    "old": "<tr>\r\n                            <td>Parsippany Hills High School</td>\r\n                            <td><a href=\"http://www.pthsd.k12.nj.us/SCH/PHHS/home.html\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Parsippany Hills High School</td>\r\n                            <td><a href=\"http://www.pthsd.k12.nj.us/SCH/PHHS/home.html\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Pequannock High School",
    "old": "<tr>\r\n                            <td>Pequannock High School</td>\r\n                            <td><a href=\"http://www.pequannock.org/hs/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Pequannock High School</td>\r\n                            <td><a href=\"http://www.pequannock.org/hs/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Pope John XXIII High School",
    "old": "<tr>\r\n                            <td>Pope John XXIII High School</td>\r\n                            <td><a href=\"http://www.popejohn.org/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Pope John XXIII High School</td>\r\n                            <td><a href=\"http://www.popejohn.org/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Randolph Township School District",
    "old": "<tr>\r\n                            <td>Randolph Township School District</td>\r\n                            <td><a href=\"http://www.rtnj.org/highschool.cfm?subpage=32141\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Randolph Township School District</td>\r\n                            <td><a href=\"http://www.rtnj.org/highschool.cfm?subpage=32141\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Roxbury High School",
    "old": "<tr>\r\n                            <td>Roxbury High School</td>\r\n                            <td><a href=\"http://www.roxbury.org/rhs/index.html\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Roxbury High School</td>\r\n                            <td><a href=\"http://www.roxbury.org/rhs/index.html\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Sussex County Tech High School",
    "old": "<tr>\r\n                            <td>Sussex County Tech High School</td>\r\n                            <td><a href=\"http://www.sussex.tec.nj.us/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Sussex County Tech High School</td>\r\n                            <td><a href=\"http://www.sussex.tec.nj.us/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Vernon Township High School",
    "old": "<tr>\r\n                            <td>Vernon Township High School</td>\r\n                            <td><a href=\"http://www.vtsd.com/vths/index.php\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Vernon Township High School</td>\r\n                            <td><a href=\"http://www.vtsd.com/vths/index.php\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Villa Walsh Academy",
    "old": "<tr>\r\n                            <td>Villa Walsh Academy</td>\r\n                            <td><a href=\"http://www.villawalsh.org/s/172/index.aspx\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Villa Walsh Academy</td>\r\n                            <td><a href=\"http://www.villawalsh.org/s/172/index.aspx\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Wallkill Valley High School",
    "old": "<tr>\r\n                            <td>Wallkill Valley High School</td>\r\n                            <td><a href=\"http://wallkill.k12.nj.us/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Wallkill Valley High School</td>\r\n                            <td><a href=\"http://wallkill.k12.nj.us/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "West Morris Mendham",
    "old": "<tr>\r\n                            <td>West Morris Mendham</td>\r\n                            <td><a href=\"http://www.wmmhs.org/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>West Morris Mendham</td>\r\n                            <td><a href=\"http://www.wmmhs.org/\" target=\"_blank\" rel=\"noopener\">"
  },
  {
    "file": "websites.html",
    "school": "Whippany Park High School",
    "old": "<tr>\r\n                            <td>Whippany Park High School</td>\r\n                            <td><a href=\"http://whippanypark.org/\" target=\"_blank\" rel=\"noopener\">",
    "new": "<tr>\r\n                            <td>Whippany Park High School</td>\r\n                            <td><a href=\"http://whippanypark.org/\" target=\"_blank\" rel=\"noopener\">"
  }
];

let updated = { 'schools.html': 0, 'websites.html': 0, 'calendar.html': 0 };

replacements.forEach(repl => {
  const file = repl.file;
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes(repl.old)) {
    content = content.replace(repl.old, repl.new);
    fs.writeFileSync(file, content, 'utf8');
    updated[file]++;
    console.log(`✓ Updated: ${repl.school} in ${file}`);
  } else {
    console.log(`⚠️  Could not find: ${repl.school} in ${file}`);
  }
});

console.log(`
Summary: schools.html=${updated['schools.html']}, websites.html=${updated['websites.html']}`);
