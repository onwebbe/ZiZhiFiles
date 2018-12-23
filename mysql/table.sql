create database if not exists zizhifiles DEFAULT CHARSET utf8 COLLATE utf8_general_ci;
use zizhifiles;
create table companyinfo(
    companyid INTEGER primary key AUTO_INCREMENT,
    companycode varchar(50) not null,
    companyname VARCHAR(300) not null,
    companylocation VARCHAR(100),
    companycategory varchar(100),
    tianyanchaurl varchar(200),
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table zizhiinfo(
    zizhiid INTEGER primary key AUTO_INCREMENT,
    zizhiname varchar(180),
    zizhilevel varchar(60),
    zizhiscope VARCHAR(300),
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
create table companyzizhi (
    companyid INTEGER,
    zizhiid INTEGER,
    zizhiapprovedate DATETIME,
    zizhivaliduntildate DATETIME,
    createddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP,
    updateddate TIMESTAMP not null DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_cpzz PRIMARY KEY (companyid, zizhiid),
    CONSTRAINT fk_company FOREIGN KEY (companyid) REFERENCES `companyinfo`(companyid) ON DELETE CASCADE,
    CONSTRAINT fk_zizhi FOREIGN KEY (zizhiid) REFERENCES `zizhiinfo`(zizhiid) ON DELETE CASCADE
);
drop table companyzizhi;
drop table companyinfo;
drop table zizhiinfo;