package frauddetection;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.voltcore.logging.VoltLogger;
import org.voltdb.SQLStmt;
import org.voltdb.VoltProcedure;
import org.voltdb.VoltTable;

public class GetActivityHistory extends VoltProcedure {

	public final SQLStmt insertHistory =
	        new SQLStmt("insert into activity (card_id,date_time,station_id,activity_code,amount,accept,date_now) values (?,?,?,?,?,?,?);");
	private static final VoltLogger fraudLog = new VoltLogger("CONSOLE");
	public ResultSet getHistoryData(String entity,int time,String unit,String from,String to){
        ResultSet res = null;
        ResultSet res2 = null;
        Connection con = null;
        Statement stmt = null;
		try {
			 //定义一个MYSQL链接对象
	        Class.forName("com.mysql.cj.jdbc.Driver").newInstance(); //MYSQL驱动
	        
	        con = DriverManager.getConnection("jdbc:mysql://localhost:3306/test_db", "root", "@Dministrat0r"); //链接MYSQL
	        stmt = con.createStatement();
	        //待完善，动态取出字段，生成查询sql。
	        String fields = null;
	        String target = "select table_name from information_schema.tables where table_schema='test_db' and table_name like '%_"+entity+"' order by table_name desc limit 0,1;";
	        String targetname= "";
	        	        
	        res = stmt.executeQuery(target);
	        
			if(res.next()){
				targetname = res.getString(1);
			}
			fraudLog.error("error-------------:"+targetname);
//			select * from E3122652832071745535_ACTIVITY where date_now>=DATE_SUB(NOW(),INTERVAL 17 HOUR);
			
			String sql =  "select * from " + targetname +" where date_now >= DATE_SUB(NOW(),INTERVAL "+ time + " " + unit + ") "
			+"limit "+ from + "," + to +";";
			
			fraudLog.error("mysql data sql-------------:"+sql);
			res2 = stmt.executeQuery(sql);
			
	    } catch (Exception e) {
	        System.out.print("MYSQL ERROR:" + e.getMessage());
	    }

		return res2;
	}
	
	public VoltTable run(String entity,int time,String unit,String from, String to) throws VoltAbortException, SQLException {
		ResultSet res = getHistoryData(entity,time,unit,from,to);
		if(res != null){
			try {
				while(res.next()){
					voltQueueSQL(insertHistory, res.getInt(1),res.getTimestamp(2),res.getInt(3),res.getInt(4),res.getInt(5),res.getInt(6),res.getTimestamp(7));
					fraudLog.error("insert-------------:"+res.getInt(1)+" "+res.getTimestamp(2)+" "+res.getInt(3)
					+" "+res.getInt(4)+" "+res.getInt(5)+" "+res.getInt(6)+" "+res.getTimestamp(7));
				}
			} catch (SQLException e) {
				e.printStackTrace();
			}

			voltExecuteSQL();
			fraudLog.error("mysql data num-------------:"+res.getRow());
		}

		fraudLog.error("finished-------------:");
		return null;
		   
	}
}
