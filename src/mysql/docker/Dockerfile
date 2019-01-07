FROM mysql:5.6
#设置免密登录
ENV MYSQL_ALLOW_EMPTY_PASSWORD yes
 
#将所需文件放到容器中
COPY /mysqlsetup.sh /mysql/mysqlsetup.sh
COPY /initData.sql /mysql/initData.sql
COPY /privileges.sql /mysql/privileges.sql
 
#设置容器启动时执行的命令
CMD ["sh", "/mysql/mysqlsetup.sh"]
