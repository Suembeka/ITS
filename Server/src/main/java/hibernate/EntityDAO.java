package hibernate;

/**
 *
 * @author ksinn
 */
import java.sql.SQLException;
import java.util.Collection;

public interface EntityDAO {

    public void add(Object entity) throws SQLException;

    public void update(int id, Object entity) throws SQLException;
    
    public void delete(Object entity) throws SQLException;

    public Object getById(Class entitytClass, int id) throws SQLException;

    public Collection getAll(Class entitytClass) throws SQLException;

    

}
