package frauddetection;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;

import org.voltdb.SQLStmt;
import org.voltdb.VoltProcedure;
import org.voltdb.VoltTable;
import org.voltdb.VoltType;
import org.voltdb.client.ClientConfig;
import org.voltdb.client.ClientFactory;
import org.voltdb.client.ProcCallException;
import org.voltdb.VoltTable.ColumnInfo;
import org.voltdb.types.TimestampType;

public class JDBCDataLoader extends VoltProcedure implements DataLoader {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
//		JDBCDataLoader ld = new JDBCDataLoader();
//		ld.importData("E3122447520404406271_ACTIVITY", "activity", 50, 1, "hour", 500);
		org.voltdb.client.Client client = null;
		ClientConfig config = null;
		try {
		config = new ClientConfig();
		client = ClientFactory.createClient(config);
		client.createConnection("123.57.234.203");
		System.out.println("11111111111");
		VoltTable[] results;
		try {
			results = client.callProcedure("@AdHoc","alter table activity using ttl 5000 ON COLUMN date_now MIGRATE TO TARGET oldactivity;").getResults();
		} catch (ProcCallException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		}
		catch (java.io.IOException e) {
		e.printStackTrace();
		System.exit(-1);
		}
		

	}

	@Override
	public VoltTable importData(String fromEntity, String toEntityName, int ttl, int time, String unit, int batchSize) {
		String getSchema = "select * from " + toEntityName +" limit 1";
		SQLStmt getSchemaStmt = new SQLStmt(getSchema);
		voltQueueSQL(getSchemaStmt);
		VoltTable[] toEntity = voltExecuteSQL();
		ResultSet res = getData(fromEntity, null, batchSize);
		try {
			String insert = mapImportDataToVoltdb(res, toEntity[0], toEntityName);
			SQLStmt insertStmt =
		            new SQLStmt(insert);
			if (res.next()) {
				
				voltQueueSQL(insertStmt, res.getInt(1),res.getTimestamp(2),res.getInt(3),res.getInt(4),res.getInt(5),res.getInt(6),res.getTimestamp(7));
			}
			
		} catch (Exception e) {
			e.printStackTrace();
		}

		voltExecuteSQL();
		return null;
	}
	        
	

	
	public ResultSet getData(String entity,VoltTable toEntity, int batchSize){
        ResultSet res = null;
		try {
		Connection con = null; //定义一个MYSQL链接对象
        Class.forName("com.mysql.cj.jdbc.Driver").newInstance(); //MYSQL驱动
        con = DriverManager.getConnection("jdbc:mysql://localhost:3306/test_db", "user", "@Dministrat0r"); //链接本地MYSQL

        Statement stmt; 
        Long ret_id;
        Long cardid;
        stmt = con.createStatement();
        //待完善，动态取出字段，生成查询sql。
        String fields = null;
        String sql = "select * from " + entity +" limit 0,10;";
        res = stmt.executeQuery(sql);
//        if (res.next()) {
//        	mapImportDataToVoltdb(res,toEntity);
//        	res.get
//        	toEntity.getColumnType(index)
//            ret_id = res.getLong(1);
//            cardid = res.getLong("CARD_ID");
            
            
//        }
	    } catch (Exception e) {
	        System.out.print("MYSQL ERROR:" + e.getMessage());
	    }
		return res;
	}
	
	public String updateTTL( int ttl,String toEntity){
		//待完善，确定如何获取ttl定义
		String updateTTL = "alter table "+ toEntity +" using ttl "+ttl+" ON COLUMN date_now MIGRATE TO TARGET oldactivity;";		
		return updateTTL;
	}
	
	public String mapImportDataToVoltdb (ResultSet res,VoltTable toEntity,String tabName) throws Exception{
		int colId = 0;
		String colclause = null;
		String valueclause = null;
			
		
		for(colId=0;colId<toEntity.getColumnCount();colId++){
			colclause = colclause +"," +toEntity.getColumnName(colId);
			valueclause = valueclause + ",?";
			VoltType paramType = toEntity.getColumnType(colId);
		       Object theValue = null;

		        switch (paramType) {
		        case STRING:
		            theValue = toEntity.getString(colId);
		            break;
		        case BIGINT:
		        case SMALLINT:
		        case TINYINT:
		        case INTEGER:
		            theValue = res.getLong(colId);
		            break;
		        case FLOAT:
		            theValue = res.getDouble(colId);
		            break;
		        case DECIMAL:
		            BigDecimal bd = res.getBigDecimal(colId);
		            theValue = new Double(bd.doubleValue());
		            break;
		        case TIMESTAMP:
		            Timestamp tt = res.getTimestamp(colId);
		            
		            theValue = tt;
		            break;
		        // TODO
		        case VOLTTABLE:
		        case BOOLEAN:
		        case VARBINARY:
		        case GEOGRAPHY:
		        case GEOGRAPHY_POINT:

		        default:
		            throw new Exception("VoltType " + paramType.toString() + " not supported");
		        }
		}
        
        

		String sql = "insert into "+tabName+"("+colclause.substring(1)+") values ("+valueclause.substring(1)+")";
		System.out.println("insert sql:"+sql);
		return sql;
		
		
	}
	
}
