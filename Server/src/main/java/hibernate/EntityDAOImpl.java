package hibernate;

/**
 *
 * @author ksinn
 */
import java.sql.SQLException;
import java.util.Collection;
import java.util.ArrayList;
import java.util.List;
import org.apache.log4j.Logger;
import org.hibernate.Session;

public class EntityDAOImpl implements EntityDAO {
    private static final Logger log = Logger.getLogger(EntityDAOImpl.class.getName());

    @Override
    public void add(Object entity) throws SQLException {
        Session session = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            session.beginTransaction();
            session.save(entity);
            session.getTransaction().commit();
        } catch (Exception ex) {
            log.error("Can not add "+entity.getClass()+" object :(", ex);
            throw ex;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
    }

    @Override
    public void update(int id, Object entity) throws SQLException {
        Session session = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            session.beginTransaction();
            session.update(entity);
            session.getTransaction().commit();
        } catch (Exception e) {
            log.error("Can not update "+entity.getClass()+" object :(", e);
            throw e;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
    }

    @Override
    public Object getById(String className, int id) throws SQLException, ClassNotFoundException {
        Session session = null;
        Object entity = null;
        try {
            Class classTemp = Class.forName(className);
            session = HibernateUtil.getSessionFactory().openSession();
            entity =  session.load(classTemp.getName(), id);
        } catch (Exception e) {
            log.error("Can not get by ID "+entity.getClass()+" object :(", e);
            throw e;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
        return entity;
    }

    @Override
    public Collection getAll(String className) throws SQLException, ClassNotFoundException {
        Session session = null;
        List entitys = new ArrayList();
        try {
            Class classTemp = Class.forName(className);
            session = HibernateUtil.getSessionFactory().openSession();
            entitys = session.createCriteria(classTemp.getName()).list();
        } catch (Exception e) {
            log.error("Can not get all objects :(", e);
            throw e;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
        return entitys;
    }

    @Override
    public void delete(Object entity) throws SQLException {
        Session session = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            session.beginTransaction();
            session.delete(entity);
            session.getTransaction().commit();
        } catch (Exception e) {
            log.error("Can not delete "+entity.getClass()+" object :(", e);
            throw e;
        } finally {
            if (session != null && session.isOpen()) {
                session.close();
            }
        }
    }

}
