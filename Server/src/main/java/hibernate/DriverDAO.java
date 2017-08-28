package hibernate;

/**
 *
 * @author ksinn
 */
import entity.Driver;
import java.sql.SQLException;
import java.util.Collection;

public interface DriverDAO {

    public void add(Driver entity) throws SQLException;

    public void update(int id, Driver key) throws SQLException;
    
    public void delete(Driver key) throws SQLException;

    public Driver getById(int key_id) throws SQLException;

    public Collection getAll() throws SQLException;

    public Driver getByName(String name) throws SQLException;
    

}
