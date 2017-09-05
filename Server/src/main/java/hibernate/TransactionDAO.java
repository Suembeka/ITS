package hibernate;

/**
 *
 * @author ksinn
 */
import entity.Transaction;
import entity.TransactionId;
import entity.Transport;
import java.sql.SQLException;
import java.util.Collection;

public interface TransactionDAO {

    public void add(Transaction entity) throws SQLException;

    public void update(TransactionId id, Transaction entity) throws SQLException;
    
    public void delete(Transaction entity) throws SQLException;

    public Transaction getById(TransactionId id) throws SQLException;
    
    public Transaction getLastForTransportId(int transport_id) throws SQLException;

    public Collection<Transaction> getAll() throws SQLException;

    

}
