package frauddetection;
import org.voltdb.VoltTable;

public interface DataLoader {

	public VoltTable importData(String fromEntity, String toEntity, int ttl, int time, String unit, int batchSize);
}
