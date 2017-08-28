package hibernate;

/**
 *
 * @author ksinn
 */
import entity.Driver;
import java.sql.SQLException;
import java.util.Collection;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.hibernate.Session;

public class DriverDAOImpl implements DriverDAO {
    private static final Logger log = Logger.getLogger(DriverDAOImpl.class.getName());

    @Override
    public void add(Driver entity) throws SQLException {
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
    public void update(int id, Driver entity) throws SQLException {
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
    public Driver getById(int id) throws SQLException {
        Session session = null;
        Driver entity = null;
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            entity = (Driver) session.load(Object.class, id);
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
    public Collection getAll() throws SQLException {
        Session session = null;
        List entitys = new ArrayList<Driver>();
        try {
            session = HibernateUtil.getSessionFactory().openSession();
            entitys = session.createCriteria(Object.class).list();
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
    public void delete(Driver entity) throws SQLException {
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

    @Override
    public Driver getByName(String name) throws SQLException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

}
